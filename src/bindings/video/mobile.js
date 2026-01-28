
export class MobileBinding {

    isScreenshotSuported() {
        return true
    }

    async screenshot(url, props={}) {
        // TODO
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

}