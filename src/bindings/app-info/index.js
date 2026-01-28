// App-Info Service 
//
// provides information about the (Desktop/Mobile/...) App that is rendering the React Code
import EventEmitter from 'events';
import { hasFeature, isElectron, isLegacyElectron, legacyApi,isReactNative } from '../../utils';
import info from '../../../package.json'
import { IncyclistAppBinding } from './desktop';
import { LegacyBinding } from './legacy';
import { NodeJSBinding } from './nodejs';
import { BrowserBinding } from './browser';
import { MobileBinding } from './mobile';

export class AppInfoBinding extends EventEmitter{

    static _instance;

    static getInstance() {
        if (!AppInfoBinding._instance)
            AppInfoBinding._instance = new AppInfoBinding()
        return AppInfoBinding._instance;
    }

    getBinding() {
        
        if (this.binding) {
            return this.binding
        }

        if ( isElectron() &&  hasFeature('appSettings.appInfo')) {
            this.bindingStr = "features"
            this.binding = new IncyclistAppBinding()
        }        
        else if (isReactNative()) {
            this.bindingStr = "mobile"
            this.binding = new MobileBinding()
        }
        else if (isLegacyElectron() &&  legacyApi.getApp) { // Legacy
            this.bindingStr = "legacy"
            this.binding = new LegacyBinding()
        }
        else if (window) { // Browser
            this.bindingStr = "browser"
            this.binding = new BrowserBinding()
        }
        else  {
            this.bindingStr = "node"
            this.binding = new NodeJSBinding()
        }

        return this.binding
    }

    getOS() {
        return this.getBinding().getOS();
    }

    getAppInfo() {
               
        const appInfo = this.getBinding().getAppInfo()
        
        if (!this.callCnt) {
            this.callCnt=1
        }
        
        return appInfo

    }

    getAppVersion() {
        return this.getAppInfo()?.version
    }

    getAppDir() {
        return this.getAppInfo()?.appDir
    }

    getSourceDir() {
        return this.getAppInfo()?.sourceDir
    }
    
    getTeampDir() {
        return this.getAppInfo()?.tempDir
    }

    isApp() {
        return this.getBinding() && this.getBinding().isApp()
    }

    getChannel() {
        return this.getBinding().getChannel()
    }

    getUIVersion()  {
        return info.version
    }

    get session() {
        return this.getAppInfo().session
    }

}

export default AppInfoBinding