import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { PairingPage } from './page'

const { service, ui, deviceAccess, devicePairing, useKeyCalls } = vi.hoisted(() => ({
    service: {
        openPage: vi.fn(() => ({ on: vi.fn(), off: vi.fn() })),
        closePage: vi.fn(),
        getPageDisplayProperties: vi.fn(() => ({ title: 'Paired Devices', capabilities: { top: [], bottom: [] }, interfaces: [], buttons: [] })),
        addSimulator: vi.fn(),
    },
    ui: { toggleFullscreen: vi.fn() },
    deviceAccess: { getProtocols: vi.fn(() => ['ant', 'ble']) },
    devicePairing: { changeInterfaceSettings: vi.fn(), getState: vi.fn(() => ({ interfaces: [{ name: 'ant', enabled: true }] })) },
    useKeyCalls: [],
}))

vi.mock('incyclist-services', () => ({
    getDevicesPageService: () => service,
    useDeviceAccess: () => deviceAccess,
    useDevicePairing: () => devicePairing,
}))

vi.mock('../../bindings/native-ui', () => ({ useAppUI: () => ui }))

vi.mock('../../hooks/ui/useKey', () => ({
    useKey: (expected, callback) => {
        useKeyCalls.push({ expected, callback })
        return [vi.fn(), vi.fn()]
    },
}))

const { openDialogMock, closeDialogMock } = vi.hoisted(() => ({ openDialogMock: vi.fn(), closeDialogMock: vi.fn() }))

vi.mock('../../components/molecules', () => ({ DialogLauncher: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ openDialog: openDialogMock, closeDialog: closeDialogMock }))
    return null
}) }))

vi.mock('../../components/modules/PairingInfo/InterfaceSettings', () => ({ default: () => null }))
vi.mock('../../components/modules/PairingInfo/DeviceSelector', () => ({ default: () => null }))

vi.mock('./screen', () => ({
    PairingScreen: ({ onCapabilityClick, onInterfaceClick, title }) => (
        <div>
            <span>{title}</span>
            <button onClick={() => onCapabilityClick('power')}>capability</button>
            <button onClick={() => onInterfaceClick('ant')}>interface</button>
        </div>
    ),
}))

const renderPage = (mode) => render(<MemoryRouter><PairingPage mode={mode} /></MemoryRouter>)

describe('PairingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useKeyCalls.length = 0
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

    test('clicking a capability tile opens the device selector dialog', () => {
        renderPage(undefined)

        fireEvent.click(screen.getByText('capability'))

        expect(openDialogMock).toHaveBeenCalled()
        const [, dialogProps] = openDialogMock.mock.calls[0]
        expect(dialogProps.capability).toBe('power')
    })

    test('clicking an interface opens the interface settings dialog with its protocols and current settings', () => {
        renderPage(undefined)

        fireEvent.click(screen.getByText('interface'))

        expect(deviceAccess.getProtocols).toHaveBeenCalledWith('ant')
        const [, dialogProps] = openDialogMock.mock.calls[0]
        expect(dialogProps.name).toBe('ant')
        expect(dialogProps.protocols).toEqual(['ant', 'ble'])
        expect(dialogProps.enabled).toBe(true)
    })

    test('confirming interface settings applies them and closes the dialog', () => {
        renderPage(undefined)

        fireEvent.click(screen.getByText('interface'))
        const [, dialogProps] = openDialogMock.mock.calls[0]

        act(() => { dialogProps.onOK({ enabled: false }) })

        expect(devicePairing.changeInterfaceSettings).toHaveBeenCalledWith('ant', { enabled: false })
        expect(closeDialogMock).toHaveBeenCalled()
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
