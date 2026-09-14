
export class BrowserBinding {

    isScreenshotSuported() {
        return false
    }

    async screenshot(url, props={}) {
        throw new Error('not supported')

    }


    isConvertSuported() {
        return false
    }

    async convert(url, props={}) {
        throw new Error('not supported')
    }

    async convertOnline(url, props={}) {
        throw new Error('not supported')
    }

    async readHeadTail(url, chunkSize) {
        throw new Error('not supported')
    }

}