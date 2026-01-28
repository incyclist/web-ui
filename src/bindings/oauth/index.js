import { hasFeature ,api, isElectron, isLegacyElectron} from "../../utils/electron/integration";

export class OAuthBinding   {

    static _instance = null;
    static getInstance() {
        if ( !OAuthBinding._instance ) {
            OAuthBinding._instance = new OAuthBinding();
        }
        return OAuthBinding._instance;
    }


    showAuthWindow(service) {
   

        if (isElectron() && hasFeature('oauth')) {
            api.oauth.showAuthWindow(service)
        }
        else if ( isLegacyElectron() && window?.localSupport?.getApp) {
            const app = window.localSupport.getApp()
            app.showAuthWindow(service)  
    
        }
        else {

        }

    }    

    async authorize(service) {
        if (isElectron() && hasFeature('oauth')) {
            const res = await api.oauth.authorize(service)

            return res;
        }
        
    }


}