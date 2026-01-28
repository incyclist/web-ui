import { api, hasFeature,isElectron,isReactNative } from "../../utils";

export default function getDirectConnectBinding() {
    try {
        if ( isElectron() && hasFeature('dc')) {
            const binding =   api.dc.getBinding()
            return binding
        }
        else if ( isReactNative()) {
            // TODO: provide RN binding
            return null
        }
        else { /*if  (AppInfoService.getInstance().isApp()) {
            console.log('~~~ ANT: Legacy Binding')
            return window.localSupport.getAnt()  // This is Ant v1
        }    
        else { // Web*/
            console.log('~~~ DC: No Binding')
            return null;
        }
    }
    catch (err) {
        this.logger.logEvent({message:'error',fn:'getDirectConnectBinding()',error:err.message||err})
    }

}