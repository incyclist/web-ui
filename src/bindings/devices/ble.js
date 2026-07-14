import { useAppState } from "incyclist-services";
import { api, hasFeature, isElectron,isReactNative } from "../../utils";
import AppInfoBinding from "../app-info";

export default function getBleBinding() {

    try {
        let binding = null;

        if ( isReactNative()) {
            // TODO: provide RN BLE binding
            return null
        }
        else if (isElectron()){

            if (hasFeature('appSettings.appInfo')) {
                const {platform}  = api.appSettings.getOSSync()
                if (platform==='linux') {
                    if (hasFeature('webble')) {
                        return api.webble.getInstance()
                    }
                    return null
                }

                // Windows: WinRT (native BLE) is the default, stable path. WebBLE can be
                // opted into per user via the WEBBLE_WINDOWS setting, to canary-test it as
                // a lower-complexity replacement without risking the default path for
                // everyone. Falls through to the regular ble path below if the desktop
                // build doesn't announce the webble capability.
                if (platform==='win32' && hasFeature('webble') && useAppState().hasFeature('WEBBLE_WINDOWS')) {
                    return api.webble.getInstance()
                }
            }


            if (hasFeature  ('ble')) {
                binding =  api.ble.getInstance();                               
            }
            else if  (AppInfoBinding.getInstance().isApp()) {
                binding = window.localSupport.getBle()
            }    
            else { // Web
                return null;
            }

            // backward compatibility
            if (binding && !hasFeature('ble-pauseLogging')) {
                binding.setServerDebug = ()=>{}
                binding.pauseLogging = () => { console.log('~~~~ PASUE LOGGIONG')}
                binding.resumeLogging = () => {}
            }
        }
        return binding;
    }
    catch (err) {
        this.logger.logEvent({message:'error',fn:'getAntBinding()',error:err.message||err})
    }

}