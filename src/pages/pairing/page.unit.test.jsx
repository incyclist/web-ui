import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { PairingPage } from './page'

const { service, ui, useKeyCalls } = vi.hoisted(() => ({
    service: {
        openPage: vi.fn(() => ({ on: vi.fn(), off: vi.fn() })),
        closePage: vi.fn(),
        getPageDisplayProperties: vi.fn(() => ({ title: 'Paired Devices', capabilities: { top: [], bottom: [] }, interfaces: [], buttons: [] })),
        addSimulator: vi.fn(),
    },
    ui: { toggleFullscreen: vi.fn() },
    useKeyCalls: [],
}))

vi.mock('incyclist-services', () => ({
    getDevicesPageService: () => service,
}))

vi.mock('../../bindings/native-ui', () => ({ useAppUI: () => ui }))

vi.mock('../../hooks/ui/useKey', () => ({
    useKey: (expected, callback) => {
        useKeyCalls.push({ expected, callback })
        return [vi.fn(), vi.fn()]
    },
}))

vi.mock('../../components/modules/PairingInfo/InterfaceSettings', () => ({ default: (props) => <div>interface-settings:{props.name}</div> }))
vi.mock('../../components/modules/PairingInfo/DeviceSelector', () => ({ default: (props) => <div>device-selector:{props.capability}</div> }))

vi.mock('./screen', () => ({
    PairingScreen: ({ title }) => <span>{title}</span>,
}))

const renderPage = (mode) => render(<MemoryRouter><PairingPage mode={mode} /></MemoryRouter>)

describe('PairingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useKeyCalls.length = 0
        service.getPageDisplayProperties.mockReturnValue({ title: 'Paired Devices', capabilities: { top: [], bottom: [] }, interfaces: [], buttons: [] })
    })

    test('opens the desktop pairing page service with forRide and the navigation source', () => {
        renderPage('start')

        expect(service.openPage).toHaveBeenCalledWith(true, undefined)
    })

    test('opens in normal mode (not for a ride) when not started from a ride entry point', () => {
        renderPage(undefined)

        expect(service.openPage).toHaveBeenCalledWith(false, undefined)
    })

    test('renders the service display props through PairingScreen', () => {
        renderPage('start')

        expect(screen.getByText('Paired Devices')).toBeTruthy()
    })

    test('renders the device selector when the service sets deviceSelection', () => {
        service.getPageDisplayProperties.mockReturnValue({ title: 'Paired Devices', capabilities: { top: [], bottom: [] }, interfaces: [], buttons: [], deviceSelection: { capability: 'power' } })

        renderPage(undefined)

        expect(screen.getByText('device-selector:power')).toBeTruthy()
    })

    test('renders no device selector when the service has none open', () => {
        renderPage(undefined)

        expect(screen.queryByText(/device-selector:/)).toBeNull()
    })

    test('renders the interface settings dialog when the service sets showInterfaceSettings', () => {
        service.getPageDisplayProperties.mockReturnValue({ title: 'Paired Devices', capabilities: { top: [], bottom: [] }, interfaces: [], buttons: [], showInterfaceSettings: { name: 'ant' } })

        renderPage(undefined)

        expect(screen.getByText('interface-settings:ant')).toBeTruthy()
    })

    test('renders no interface settings dialog when the service has none open', () => {
        renderPage(undefined)

        expect(screen.queryByText(/interface-settings:/)).toBeNull()
    })

    test('registers "f" for fullscreen and Shift+S to add the simulator', () => {
        renderPage(undefined)

        const fullscreen = useKeyCalls.find(c => c.expected === 'f')
        fullscreen.callback()
        expect(ui.toggleFullscreen).toHaveBeenCalled()

        const shiftS = useKeyCalls.find(c => c.expected?.code === 'KeyS' && c.expected?.shiftKey)
        shiftS.callback()
        expect(service.addSimulator).toHaveBeenCalled()
    })

    test('closes the page service on unmount', () => {
        const { unmount } = renderPage(undefined)
        unmount()

        expect(service.closePage).toHaveBeenCalled()
    })
})
