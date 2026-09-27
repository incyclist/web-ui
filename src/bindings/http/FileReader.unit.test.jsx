import { describe, test, expect, vi, beforeEach } from 'vitest'

const { readFile } = vi.hoisted(() => ({ readFile: vi.fn() }))

vi.mock('incyclist-services', () => ({
    getBindings: () => ({ fs: { readFile } })
}))

import { FileLoader } from './FileReader'

describe('FileLoader.open', () => {

    let loader

    beforeEach(() => {
        readFile.mockReset()
        loader = FileLoader.getInstance()
    })

    describe('type:file (scanner/service convention)', () => {

        test('reads via the filesystem binding using filename when present', async () => {
            readFile.mockResolvedValue('<gpx/>')

            const result = await loader.open({ type:'file', filename:'/routes/a.gpx', dir:'/routes', name:'a', ext:'gpx', delimiter:'/' })

            expect(readFile).toHaveBeenCalledWith('/routes/a.gpx', 'utf8')
            expect(result).toEqual({ data:'<gpx/>' })
        })

        test('builds the path from dir/name/ext when filename is absent', async () => {
            readFile.mockResolvedValue('<gpx/>')

            await loader.open({ type:'file', dir:'/routes', name:'a', ext:'gpx', delimiter:'/' })

            expect(readFile).toHaveBeenCalledWith('/routes/a.gpx', 'utf8')
        })

        test('requests no encoding conversion for a binary file', async () => {
            readFile.mockResolvedValue(Buffer.from([1,2,3]))

            await loader.open({ type:'file', filename:'/routes/a.epp', encoding:'binary' })

            expect(readFile).toHaveBeenCalledWith('/routes/a.epp', undefined)
        })

        test('a read failure resolves to an error, not a rejection', async () => {
            readFile.mockRejectedValue(new Error('ENOENT'))

            const result = await loader.open({ type:'file', filename:'/routes/missing.gpx' })

            expect(result).toEqual({ error:'ENOENT' })
        })
    })

    describe('type:url', () => {

        test('still fetches a url-typed file (unaffected by the type:file fix)', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok:true, headers:{ get: () => 'text/xml' }, text: () => Promise.resolve('<gpx/>')
            })

            const result = await loader.open({ type:'url', url:'file:///routes/a.gpx' })

            expect(global.fetch).toHaveBeenCalledWith('file:///routes/a.gpx')
            expect(result).toEqual({ data:'<gpx/>' })
        })
    })

    describe('type:file with a raw browser File object (Dropzone fallback)', () => {

        test('reads a single real File via FileReader (jsdom)', async () => {
            const file = new File(['<gpx/>'], 'a.gpx', { type:'text/xml' })

            const result = await loader.open({ type:'file', file })

            expect(result).toEqual({ data:'<gpx/>' })
        })

        test('an unrecognised info shape resolves to an internal error rather than throwing', async () => {
            const result = await loader.open({ type:'something-else' })
            expect(result).toEqual({ error:'Internal Error', key:'invalid_srctype' })
        })
    })
})
