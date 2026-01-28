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
                    return null;            
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