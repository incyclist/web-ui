import { isElectron,isReactNative  } from '../../utils';
import { DesktopBinding } from './desktop';
import { MobileBinding } from './mobile';
import { BrowserBinding } from './browser';

export class VideoProcessing {

    
    constructor() {
        if ( isElectron() )
            this.binding = new DesktopBinding()
        else if ( isReactNative()) {
            this.binding = new MobileBinding()
        }
        else { 
            this.binding = new BrowserBinding()
        }
        
    }

    isScreenshotSuported() {
        return this.binding.isScreenshotSuported()
    }

    async screenshot(url, props={}) {
        return this.binding.screenshot(url,props)

    }


    isConvertSuported() {
        return this.binding.isConvertSuported()
    }

    async convert(url, props={}) {
        return this.binding.convert(url,props)
    }

    async convertOnline(url, props={}) {
        return this.binding.convertOnline(url,props)
    }

}