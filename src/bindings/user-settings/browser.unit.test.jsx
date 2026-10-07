import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import UserSettingsWebBinding from './browser'

beforeEach(() => {
    // Node's experimental localStorage can shadow jsdom's origin-scoped storage.
    const storageWindow = new JSDOM('', { url: 'http://localhost' }).window
    vi.stubGlobal('localStorage', storageWindow.localStorage)
    window.sessionStorage.clear()
})
afterEach(() => vi.unstubAllGlobals())

test('route favorites survive a new browser session while other settings remain session-scoped', async () => {
    const binding = new UserSettingsWebBinding()
    await binding.save({ routes: { favorites: ['route-1', 'route-2'] }, preferences: { units: 'imperial' } })
    window.sessionStorage.clear()
    const reopened = await new UserSettingsWebBinding().getAll()
    expect(reopened.routes.favorites).toEqual(['route-1', 'route-2'])
    expect(reopened.preferences).toBeUndefined()
    expect(Object.keys(window.localStorage)).toEqual(['incyclist.routeFavorites'])
})

test('removing all favorites persists an empty list rather than restoring old bookmarks', async () => {
    const binding = new UserSettingsWebBinding()
    await binding.save({ routes: { favorites: ['route-1'] } })
    await binding.save({ routes: { favorites: [] } })
    window.sessionStorage.clear()
    expect((await new UserSettingsWebBinding().getAll()).routes.favorites).toEqual([])
})

test('ignores malformed stored favorites and preserves session settings', async () => {
    window.localStorage.setItem('incyclist.routeFavorites', '{bad json')
    window.sessionStorage.setItem('routes', JSON.stringify({ favorites: ['session-route'] }))
    expect((await new UserSettingsWebBinding().getAll()).routes.favorites).toEqual(['session-route'])
})
