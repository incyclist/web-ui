import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { NavigationBridge } from './NavigationBridge'
import NativeUiService from '../../../bindings/native-ui'

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock('react-router', () => ({
    useNavigate: () => navigateMock,
}))

describe('NavigationBridge', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        const service = NativeUiService.getInstance()
        service.navigate = null
        service.pendingNavigations = []
    })

    test('registers useNavigate()\'s function with the native-ui binding on mount', () => {
        render(<NavigationBridge />)

        NativeUiService.getInstance().openPage('/routes')

        expect(navigateMock).toHaveBeenCalledWith('/routes', undefined)
    })

    test('flushes a navigation queued before it mounted', () => {
        // openPage() called before NavigationBridge has rendered - today's silent no-op bug
        NativeUiService.getInstance().openPage('/devices', { source: '/routes' })
        expect(navigateMock).not.toHaveBeenCalled()

        render(<NavigationBridge />)

        expect(navigateMock).toHaveBeenCalledWith('/devices', { state: { source: '/routes' } })
    })
})
