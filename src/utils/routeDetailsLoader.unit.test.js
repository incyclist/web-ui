import { describe, test, expect, vi, beforeEach } from 'vitest'
import { RouteDetailsQueue } from './routeDetailsLoader'

const deferred = () => {
    let resolve
    const promise = new Promise(r => { resolve = r })
    return { promise, resolve }
}

const makeService = () => {
    const calls = []
    const deferredsById = new Map()
    return {
        calls,
        getRouteDetails: vi.fn((id) => {
            calls.push(id)
            const d = deferred()
            deferredsById.set(id, d)
            return d.promise
        }),
        resolve: (id, details) => deferredsById.get(id)?.resolve(details)
    }
}

describe('RouteDetailsQueue', () => {

    let service
    let queue

    beforeEach(() => {
        service = makeService()
        queue = new RouteDetailsQueue(2)
    })

    test('two requests for the same id share one getRouteDetails() call and both get the result', async () => {
        const first = vi.fn()
        const second = vi.fn()

        queue.request(service, 'route-1', first)
        queue.request(service, 'route-1', second)

        expect(service.getRouteDetails).toHaveBeenCalledTimes(1)
        expect(service.getRouteDetails).toHaveBeenCalledWith('route-1')

        service.resolve('route-1', { points: [1] })
        await Promise.resolve()
        await Promise.resolve()

        expect(first).toHaveBeenCalledWith({ points: [1] })
        expect(second).toHaveBeenCalledWith({ points: [1] })
    })

    test('does not start more than the concurrency cap at once', () => {
        queue.request(service, 'a', vi.fn())
        queue.request(service, 'b', vi.fn())
        queue.request(service, 'c', vi.fn())
        queue.request(service, 'd', vi.fn())
        queue.request(service, 'e', vi.fn())

        expect(service.getRouteDetails).toHaveBeenCalledTimes(2)
        expect(service.calls).toEqual(['a', 'b'])
    })

    test('a slot freed by a completed job is picked up by the next queued request', async () => {
        queue.request(service, 'a', vi.fn())
        queue.request(service, 'b', vi.fn())
        queue.request(service, 'c', vi.fn())

        expect(service.calls).toEqual(['a', 'b'])

        service.resolve('a', { points: [] })
        await Promise.resolve()
        await Promise.resolve()
        await Promise.resolve()

        expect(service.calls).toEqual(['a', 'b', 'c'])
    })

    test('cancelling a still-queued request removes it from the queue - it never starts', async () => {
        queue.request(service, 'a', vi.fn())
        queue.request(service, 'b', vi.fn())
        const cancelC = queue.request(service, 'c', vi.fn())

        expect(service.calls).toEqual(['a', 'b'])

        cancelC()

        service.resolve('a', { points: [] })
        await Promise.resolve()
        await Promise.resolve()
        await Promise.resolve()

        // 'c' was dequeued while waiting - the freed slot is not spent on it
        expect(service.calls).toEqual(['a', 'b'])
        expect(service.getRouteDetails).not.toHaveBeenCalledWith('c')
    })

    test('cancelling one of several listeners for the same id leaves the others unaffected', async () => {
        const first = vi.fn()
        const second = vi.fn()

        const cancelFirst = queue.request(service, 'route-1', first)
        queue.request(service, 'route-1', second)

        cancelFirst()

        service.resolve('route-1', { points: [1] })
        await Promise.resolve()
        await Promise.resolve()

        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledWith({ points: [1] })
    })

    test('cancelling after the job has started does not free a slot early / does not throw', async () => {
        const cancelA = queue.request(service, 'a', vi.fn())
        queue.request(service, 'b', vi.fn())
        queue.request(service, 'c', vi.fn())

        cancelA() // 'a' is already running - cancelling it must not remove it from "active"

        expect(service.calls).toEqual(['a', 'b'])

        service.resolve('a', { points: [] })
        await Promise.resolve()
        await Promise.resolve()
        await Promise.resolve()

        expect(service.calls).toEqual(['a', 'b', 'c'])
    })

    test('an id with no listeners left when its turn comes is skipped without consuming a slot', async () => {
        // cap of 1 so 'b' and 'c' are genuinely still queued (not started) behind 'a'
        const single = new RouteDetailsQueue(1)

        single.request(service, 'a', vi.fn())
        const cancelB = single.request(service, 'b', vi.fn())
        single.request(service, 'c', vi.fn())

        expect(service.calls).toEqual(['a'])

        cancelB()

        service.resolve('a', { points: [] })
        await Promise.resolve()
        await Promise.resolve()
        await Promise.resolve()

        expect(service.calls).toEqual(['a', 'c'])
    })

    test('ignores calls with no id or an invalid service', () => {
        expect(() => queue.request(service, undefined, vi.fn())).not.toThrow()
        expect(() => queue.request({}, 'x', vi.fn())).not.toThrow()
        expect(service.getRouteDetails).not.toHaveBeenCalled()
    })
})
