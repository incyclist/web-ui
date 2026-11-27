import { describe, test, expect, vi, beforeEach } from 'vitest'

const { mocks } = vi.hoisted(() => ({
    mocks: {
        appInfo: { appDir: '/app' },
        settings: {},
        join: vi.fn(),
        fs: { ensureDir: vi.fn(), readdir: vi.fn(), readFile: vi.fn(), writeFile: vi.fn() },
        logEvent: vi.fn(),
    },
}))

vi.mock('incyclist-services', () => ({
    useUserSettings: () => ({ get: (key) => mocks.settings[key] }),
}))

vi.mock('gd-eventlog', () => ({
    EventLogger: class { logEvent(e) { mocks.logEvent(e) } },
}))

vi.mock('../../utils/electron/integration', () => ({
    api: { fs: { unlink: vi.fn() } },
    hasFeature: () => false,
}))

vi.mock('..', () => ({
    usePath: () => ({ join: mocks.join }),
    fs: mocks.fs,
    AppInfoBinding: { getInstance: () => ({ getAppInfo: () => mocks.appInfo }) },
}))

import { RepositoryAppBinding } from './desktop'

describe('RepositoryAppBinding', () => {

    let binding
    let written

    // like the path binding of the desktop app, which returns null if path.join throws in the main process
    const strictJoin = (...parts) => (parts.every(p => typeof p === 'string') ? parts.join('/') : null)

    beforeEach(() => {
        vi.clearAllMocks()
        mocks.appInfo = { appDir: '/app' }
        mocks.settings = {}
        mocks.join.mockImplementation(strictJoin)
        written = ''
        mocks.fs.ensureDir.mockResolvedValue(true)
        mocks.fs.writeFile.mockImplementation(async (_file, str) => { written = str })
        mocks.fs.readFile.mockImplementation(async () => written)
    })

    describe('write', () => {

        test('writes to <appDir>/<repo>/<resource>.json', async () => {
            binding = new RepositoryAppBinding()
            const repo = await binding.create('activities')

            const ok = await repo.write('db', { a: 1 })

            expect(ok).toBe(true)
            expect(mocks.fs.writeFile).toHaveBeenCalledWith('/app/activities/db.json', '{"a":1}', expect.anything())
        })

        test('does not call writeFile with a null path if the app directory is not available, and logs why (once)', async () => {
            mocks.appInfo = {}
            binding = new RepositoryAppBinding()
            const repo = await binding.create('activities')

            const first = await repo.write('db', { a: 1 })
            const second = await repo.write('db', { a: 2 })

            expect(first).toBe(false)
            expect(second).toBe(false)
            expect(mocks.fs.writeFile).not.toHaveBeenCalled()
            expect(mocks.logEvent).toHaveBeenCalledTimes(1)
            expect(mocks.logEvent).toHaveBeenCalledWith(expect.objectContaining({
                message: 'error', fn: 'write', repo: 'activities', error: 'repository path not available',
                baseDirType: 'undefined', repoDirType: 'object', settingType: 'undefined',
            }))
        })

        test('recovers once the app directory becomes available (repository created without a directory)', async () => {
            mocks.appInfo = {}
            binding = new RepositoryAppBinding()
            const repo = await binding.create('activities')
            expect(await repo.write('db', { a: 1 })).toBe(false)

            mocks.appInfo = { appDir: '/app' }
            const ok = await repo.write('db', { a: 1 })

            expect(ok).toBe(true)
            expect(mocks.fs.ensureDir).toHaveBeenCalledWith('/app/activities')
            expect(mocks.fs.writeFile).toHaveBeenCalledWith('/app/activities/db.json', '{"a":1}', expect.anything())
        })

        test('a repository directory in the user settings that is not a string is ignored', async () => {
            mocks.settings['repo.activities'] = { not: 'a path' }
            binding = new RepositoryAppBinding()
            const repo = await binding.create('activities')

            await repo.write('db', { a: 1 })

            expect(mocks.fs.writeFile).toHaveBeenCalledWith('/app/activities/db.json', '{"a":1}', expect.anything())
        })

        test('a repository directory in the user settings is used', async () => {
            mocks.settings['repo.activities'] = '/custom/dir'
            binding = new RepositoryAppBinding()
            const repo = await binding.create('activities')

            await repo.write('db', { a: 1 })

            expect(mocks.fs.writeFile).toHaveBeenCalledWith('/custom/dir/db.json', '{"a":1}', expect.anything())
        })

        test('does not write if the path binding fails to join', async () => {
            binding = new RepositoryAppBinding()
            const repo = await binding.create('activities')
            mocks.join.mockReturnValue(null)

            const ok = await repo.write('db', { a: 1 })

            expect(ok).toBe(false)
            expect(mocks.fs.writeFile).not.toHaveBeenCalled()
        })
    })

    describe('read', () => {
        test('returns null instead of reading a null path', async () => {
            mocks.appInfo = {}
            binding = new RepositoryAppBinding()
            const repo = await binding.create('activities')

            expect(await repo.read('db')).toBeNull()
            expect(mocks.fs.readFile).not.toHaveBeenCalled()
        })
    })

    describe('list', () => {
        test('returns an empty list if the directory is not available', async () => {
            mocks.appInfo = {}
            binding = new RepositoryAppBinding()

            expect(await binding.list('activities')).toEqual([])
            expect(mocks.fs.readdir).not.toHaveBeenCalled()
        })
    })
})
