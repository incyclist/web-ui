import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen as rtlScreen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { RoutesPage } from './page'

// Minimal stand-in for incyclist-services' Observer (on/off/once/emit, chainable .on()).
const { FakeObserver, mockService } = vi.hoisted(() => {
    class FakeObserver {
        constructor() { this.listeners = {} }
        on(event, cb) { (this.listeners[event] ??= []).push(cb); return this }
        off(event, cb) { this.listeners[event] = (this.listeners[event] ?? []).filter(l => l !== cb); return this }
        once(event, cb) { const wrapped = (...args) => { this.off(event, wrapped); cb(...args) }; return this.on(event, wrapped) }
        emit(event, ...args) { (this.listeners[event] ?? []).slice().forEach(cb => cb(...args)) }
        stop() {}
    }

    const mockService = {
        getScreenProps: () => ({}),
        setScreenProps: () => {},
        onResize: () => {},
        isStillLoading: () => false,
        preload: () => ({ wait: () => Promise.resolve() }),
        open: vi.fn(),
        getStartSettings: () => ({}),
        close: () => {},
    }

    return { FakeObserver, mockService }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Observer: FakeObserver,
        useDevicePairing: () => ({ isReadyToStart: () => false }),
        useRouteList: () => mockService,
    }
})

// Stand-in for RoutesScreen/RouteList (./screen.jsx). Mirrors the real RouteList's
// subscription contract exactly: cards are cached in local state on first render and
// are ONLY ever refreshed by the per-list observer's 'updated' event - never by simply
// re-reading list.getCards() on a parent re-render. This is what makes the per-list
// `observer.emit('updated', ...)` call in page.jsx the sole trigger for a visible refresh.
vi.mock('./screen', () => {

    function RouteListStub({ list }) {
        const [state, setState] = React.useState({ cards: list.getCards() })
        const initialized = React.useRef(false)

        React.useEffect(() => {
            if (initialized.current) return
            initialized.current = true
            const onUpdate = () => setState({ cards: list.getCards() })
            list?.observer?.on('updated', onUpdate)
            return () => list?.observer?.off('updated', onUpdate)
        }, [list])

        return <div data-testid={`list-${list.getId()}`}>{state.cards.length}</div>
    }

    function RoutesScreen({ data }) {
        if (!data) return null
        return <div>{data.map((list, idx) => <RouteListStub list={list} key={idx} />)}</div>
    }

    return { RoutesScreen }
})

function makeCardList(id, title, initialCount) {
    let count = initialCount
    return {
        id,
        title, // CardList's `protected title` ctor-param is a real runtime field, accessible from untyped JS
        getId: () => id,
        getTitle: () => title,
        getCards: () => Array.from({ length: count }, (_, i) => ({
            getId: () => `${id}-card-${i}`,
            getTitle: () => `Card ${i}`,
        })),
        setCardCount: (n) => { count = n },
    }
}

describe('RoutesPage', () => {

    let mainObserver
    let cardList

    beforeEach(() => {
        mainObserver = new FakeObserver()
        cardList = makeCardList('list-1', 'My Routes', 3)
        mockService.open.mockReturnValue({ observer: mainObserver, lists: [cardList] })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('refreshes the visible list in place after an import, without remounting the page', async () => {
        render(<MemoryRouter><RoutesPage /></MemoryRouter>)

        expect(await rtlScreen.findByTestId('list-list-1')).toHaveTextContent('3')

        // simulate the service reacting to an import: recomputes its lists and re-emits
        // them on the SAME CardList instance (title unchanged, only its card count differs)
        cardList.setCardCount(4)
        act(() => {
            mainObserver.emit('updated', [cardList], 'user')
        })

        expect(rtlScreen.getByTestId('list-list-1')).toHaveTextContent('4')
    })

    test('refreshes the visible list in place after a delete, without remounting the page', async () => {
        // RouteCard._delete() ends by calling getRouteList().emitLists('updated', ...),
        // the exact same event/payload shape as an import - so this exercises the same
        // code path as the import test above, just with the card count going down.
        render(<MemoryRouter><RoutesPage /></MemoryRouter>)

        expect(await rtlScreen.findByTestId('list-list-1')).toHaveTextContent('3')

        cardList.setCardCount(2)
        act(() => {
            mainObserver.emit('updated', [cardList], 'user')
        })

        expect(rtlScreen.getByTestId('list-list-1')).toHaveTextContent('2')
    })
})
