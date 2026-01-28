import { v4 as createSession } from 'uuid';
import { useReactNative } from '../../hooks/integration/ReactNative';

// Mobile Binding.
// Binding to be used for Web page running inside IncyclistApp on Phone or Tablet (using ReactNative)

export class MobileBinding {

    constructor() {
        this._session = createSession();
        this.rn = useReactNative()
    }

    getOS() {   
        return this.rn.getOS()
    }

    getAppInfo() {
        const appInfo = this.rn.getAppInfo()??{}
        return {...appInfo, session: this._session}
    }

    isApp() {
        return true;
    }

    getChannel() {
        return 'mobile';
    }

    get session() {
        return this._session
    }



}
