import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'

const { service, converter } = vi.hoisted(() => ({
    service: { getActivityDetails: vi.fn() },
    converter: { convert: vi.fn(), getUnit: vi.fn() }
}))
vi.mock('incyclist-services', async importOriginal => ({
    ...await importOriginal(),
    useActivityList: () => service,
    useUnitConverter: () => converter,
    useUserSettings: () => ({ get: () => ({ ftp: 240 }) }),
    useAppsService: () => ({ getName: key => ({ strava: 'Strava', intervals: 'Intervals.icu' }[key] ?? key) })
}))
// The existing chart has its own rendering; test the activity data delivered to it here.
vi.mock('../ActivityPreview', () => ({
    ActivityPreview: ({ activity, ftp }) => {
        if (activity.corrupt) throw new Error('Invalid power profile')
        return <div data-testid='power-chart' data-count={activity.logs.length} data-ftp={ftp} />
    }
}))

import { EventLogger } from 'gd-eventlog'
import { Observer, formatDateTime } from 'incyclist-services'
import { ActivityListItem } from './ActivityListItem'

const summary = {
    id: 'ride-1', title: 'Morning ride', startTime: new Date('2026-10-18T10:30:00Z').getTime(),
    rideTime: 3900, distance: { value: 32.5, unit: 'km' }, totalElevation: { value: 412, unit: 'm' }
}
const details = { title: 'Incyclist ride: Morning ride', logs: [{ time: 0, power: 100 }, { time: 10, power: 220 }] }
const activityInfo = { summary, details }

describe('ActivityListItem', () => {
    beforeEach(() => {
        service.getActivityDetails.mockReturnValue(new Observer())
        converter.convert.mockImplementation((value, dimension) => dimension === 'distance' ? value / 1000 : value)
        converter.getUnit.mockImplementation(dimension => dimension === 'distance' ? 'km' : 'm')
        vi.spyOn(EventLogger.prototype, 'logEvent').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    test('shows the service summary title, all required metrics, and the power profile', () => {
        render(<ActivityListItem activityInfo={activityInfo} />)
        expect(screen.getByRole('heading', { name: summary.title })).toBeInTheDocument()
        expect(screen.queryByText(details.title)).not.toBeInTheDocument()
        const start = new Date(summary.startTime)
        expect(screen.getByText(`${formatDateTime(start, '%d.%m.%Y')} · ${formatDateTime(start, '%H:%M')}`)).toBeInTheDocument()
        for (const text of ['1h 5min', '32.5 km', '412 m', 'Duration', 'Distance', 'Total ascent']) {
            expect(screen.getByText(text)).toBeInTheDocument()
        }
        expect(screen.getByRole('img', { name: 'Power profile for Morning ride' })).toBeInTheDocument()
        expect(screen.getByTestId('power-chart')).toHaveAttribute('data-ftp', '240')
        expect(service.getActivityDetails).not.toHaveBeenCalled()
    })

    test('preserves formatted imperial values and legitimate zero values', () => {
        const { rerender } = render(<ActivityListItem activityInfo={{ summary: {
            ...summary, distance: { value: '20.2', unit: 'mi' }, totalElevation: { value: '1352', unit: 'ft' }
        }, details }} />)
        expect(screen.getByText('20.2 mi')).toBeInTheDocument()
        expect(screen.getByText('1352 ft')).toBeInTheDocument()
        rerender(<ActivityListItem activityInfo={{ summary: { ...summary, rideTime: 0, distance: 0, totalElevation: 0 }, details }} />)
        expect(screen.getByText('0min')).toBeInTheDocument()
        expect(screen.getByText('0.0 km')).toBeInTheDocument()
        expect(screen.getByText('0 m')).toBeInTheDocument()
    })

    test('shows upload pills only for statuses delivered in the summary', () => {
        const { rerender } = render(<ActivityListItem activityInfo={activityInfo} />)
        expect(screen.queryByLabelText('Upload status')).toBeNull()
        rerender(<ActivityListItem activityInfo={{ ...activityInfo, summary: { ...summary, uploadStatus: [
            { service: 'strava', status: 'success' }, { service: 'intervals', status: 'failure' }
        ] } }} />)
        expect(screen.getByText('Strava · Uploaded')).toBeInTheDocument()
        expect(screen.getByText('Intervals.icu · Upload failed')).toBeInTheDocument()
    })

    test('opens by card, details button, and keyboard; deleting does not open details', () => {
        const onClick = vi.fn(), onDelete = vi.fn()
        render(<ActivityListItem activityInfo={activityInfo} onClick={onClick} onDelete={onDelete} />)
        const card = screen.getByRole('article', { name: 'Activity Morning ride' })
        fireEvent.click(card)
        fireEvent.keyDown(card, { key: 'Enter' })
        fireEvent.keyDown(card, { key: ' ' })
        fireEvent.click(screen.getByRole('button', { name: 'View details for Morning ride' }))
        expect(onClick).toHaveBeenCalledTimes(4)
        expect(onClick).toHaveBeenLastCalledWith('ride-1')
        fireEvent.click(screen.getByRole('button', { name: 'Delete Morning ride' }))
        expect(onDelete).toHaveBeenCalledOnce()
        expect(onClick).toHaveBeenCalledTimes(4)
    })

    test('loads details only inside the fold and releases subscriptions when folded away', () => {
        const observer = new Observer()
        service.getActivityDetails.mockReturnValue(observer)
        const off = vi.spyOn(observer, 'off')
        const { rerender } = render(<ActivityListItem activityInfo={{ summary }} outsideFold />)
        expect(screen.getByTestId('activity-list-item-skeleton')).toBeInTheDocument()
        expect(service.getActivityDetails).not.toHaveBeenCalled()
        rerender(<ActivityListItem activityInfo={{ summary }} outsideFold={false} />)
        expect(service.getActivityDetails).toHaveBeenCalledWith('ride-1')
        expect(screen.getByText('Loading power profile…')).toBeInTheDocument()
        rerender(<ActivityListItem activityInfo={{ summary }} outsideFold />)
        expect(off).toHaveBeenCalledWith('loaded', expect.any(Function))
        act(() => observer.emit('loaded', details))
        expect(screen.queryByTestId('power-chart')).toBeNull()
    })

    test('uses asynchronously loaded logs and ascent without replacing the summary title', () => {
        const observer = new Observer()
        service.getActivityDetails.mockReturnValue(observer)
        render(<ActivityListItem activityInfo={{ summary: { ...summary, totalElevation: undefined } }} />)
        act(() => observer.emit('loaded', { ...details, totalElevation: 120 }))
        expect(screen.getByTestId('power-chart')).toHaveAttribute('data-count', '2')
        expect(screen.getByText('120 m')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Morning ride' })).toBeInTheDocument()
        expect(service.getActivityDetails).toHaveBeenCalledOnce()
    })

    test('handles failed detail loading and missing metrics without hiding the card', () => {
        const observer = new Observer()
        service.getActivityDetails.mockReturnValue(observer)
        render(<ActivityListItem activityInfo={{ summary: { id: 'empty', title: 'Incomplete ride' } }} />)
        act(() => observer.emit('load-error', 'Unavailable'))
        expect(screen.getByText('Power profile unavailable')).toBeInTheDocument()
        expect(screen.getAllByText('—')).toHaveLength(3)
        expect(screen.getByText('Date unavailable')).toBeInTheDocument()
    })

    test('shows an unavailable profile for logs without power', () => {
        render(<ActivityListItem activityInfo={{ summary, details: { logs: [{ time: 0 }] } }} />)
        expect(screen.getByText('Power profile unavailable')).toBeInTheDocument()
        expect(screen.queryByTestId('power-chart')).toBeNull()
    })
    test('renders a missing activity or ID without crashing or requesting details', () => {
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
        const { container, rerender } = render(<ActivityListItem />)
        expect(container).toBeEmptyDOMElement()
        rerender(<ActivityListItem activityInfo={{ summary: { title: 'Missing ID' } }} />)
        expect(screen.getByRole('heading', { name: 'Missing ID' })).toBeInTheDocument()
        expect(screen.getByText('Power profile unavailable')).toBeInTheDocument()
        expect(service.getActivityDetails).not.toHaveBeenCalled()
        expect(errors).not.toHaveBeenCalled()
    })

    test('logs card and keyboard activation and logs deletion exactly once through the Button atom', () => {
        const onClick = vi.fn(), onDelete = vi.fn()
        render(<ActivityListItem activityInfo={activityInfo} onClick={onClick} onDelete={onDelete} />)
        const card = screen.getByRole('article', { name: 'Activity Morning ride' })
        fireEvent.click(card)
        fireEvent.keyDown(card, { key: 'Enter' })
        expect(EventLogger.prototype.logEvent).toHaveBeenCalledWith({ message: 'tile clicked', activityId: 'ride-1', eventSource: 'user' })
        expect(EventLogger.prototype.logEvent).toHaveBeenCalledWith({ message: 'key pressed', key: 'Enter', activityId: 'ride-1', eventSource: 'user' })
        vi.mocked(EventLogger.prototype.logEvent).mockClear()
        fireEvent.click(screen.getByRole('button', { name: 'Delete Morning ride' }))
        expect(EventLogger.prototype.logEvent).toHaveBeenCalledExactlyOnceWith({ message: 'button clicked', button: 'delete', activityId: 'ride-1', eventSource: 'user' })
        expect(onDelete).toHaveBeenCalledOnce()
        expect(onClick).toHaveBeenCalledTimes(2)
    })

    test('converts raw detail ascent using the selected imperial units', () => {
        const observer = new Observer()
        service.getActivityDetails.mockReturnValue(observer)
        converter.convert.mockImplementation((value, dimension) => dimension === 'elevation' ? Math.round(value * 3.280839895) : value / 1609.344)
        converter.getUnit.mockImplementation(dimension => dimension === 'elevation' ? 'ft' : 'mi')
        render(<ActivityListItem activityInfo={{ summary: { ...summary, distance: { value: 20.2, unit: 'mi' }, totalElevation: undefined } }} />)
        act(() => observer.emit('loaded', { ...details, totalElevation: 120 }))
        expect(screen.getByText('394 ft')).toBeInTheDocument()
        expect(screen.getByText('20.2 mi')).toBeInTheDocument()
    })

    test('finishes loading when the service never emits and accepts a late result', () => {
        vi.useFakeTimers()
        const observer = new Observer()
        service.getActivityDetails.mockReturnValue(observer)
        render(<ActivityListItem activityInfo={{ summary }} />)
        expect(screen.getByText('Loading power profile…')).toBeInTheDocument()
        act(() => vi.advanceTimersByTime(60000))
        expect(screen.getByText('Power profile unavailable')).toBeInTheDocument()
        act(() => observer.emit('loaded', details))
        expect(screen.getByTestId('power-chart')).toBeInTheDocument()
    })

    test('cancels the loading timeout and subscriptions when unmounted', () => {
        vi.useFakeTimers()
        const observer = new Observer()
        service.getActivityDetails.mockReturnValue(observer)
        const off = vi.spyOn(observer, 'off')
        const { unmount } = render(<ActivityListItem activityInfo={{ summary }} />)
        expect(vi.getTimerCount()).toBe(1)
        unmount()
        expect(vi.getTimerCount()).toBe(0)
        expect(off).toHaveBeenCalledWith('loaded', expect.any(Function))
    })

    test('shows an unavailable profile when the service returns no observer', () => {
        service.getActivityDetails.mockReturnValue(undefined)
        render(<ActivityListItem activityInfo={{ summary }} />)
        expect(screen.getByText('Power profile unavailable')).toBeInTheDocument()
    })

    test('isolates a broken power profile without hiding another activity', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        render(<>
            <ActivityListItem activityInfo={{ summary: { ...summary, id: 'broken', title: 'Broken ride' }, details: { ...details, corrupt: true } }} />
            <ActivityListItem activityInfo={activityInfo} />
        </>)
        expect(screen.queryByRole('heading', { name: 'Broken ride' })).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Morning ride' })).toBeInTheDocument()
    })

})
