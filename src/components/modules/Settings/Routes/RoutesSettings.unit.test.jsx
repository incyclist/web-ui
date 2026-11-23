import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('./RouteServersSettings', () => ({ RouteServersSettings: () => <div>servers-panel</div> }))
vi.mock('../RouteSharing', () => ({ RouteSharingSettings: () => <div>sharing-panel</div> }))

import { RoutesSettingsView } from './RoutesSettings'

describe('RoutesSettingsView', () => {
    test('shows only Route Servers when route sharing is not available', () => {
        render(<RoutesSettingsView showRouteSharing={false} />)

        expect(screen.getByText('servers-panel')).toBeDefined()
        expect(screen.queryByText('sharing-panel')).toBeNull()
    })

    test('shows Route Sharing below Route Servers when available', () => {
        const { container } = render(<RoutesSettingsView showRouteSharing={true} />)

        expect(container.textContent).toBe('servers-panelsharing-panel')
    })
})
