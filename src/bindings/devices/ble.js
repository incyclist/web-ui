import { EventLogger } from "gd-eventlog";
import { getKnownDeviceNames, useAppState } from "incyclist-services";
import { api, hasFeature, isElectron,isReactNative } from "../../utils";
import AppInfoBinding from "../app-info";

const logger = new EventLogger('BleBinding')

/**
 * The WebBLE binding of the desktop app keeps a permanent block list of devices that are not worth probing again. The
 * list of known trainer and sensor names, which keeps real trainers off that list, is owned by incyclist-services and
 * delivered with this bundle, so that it can change without a desktop release. A desktop shell that does not announce
 * 'webble-known-names' does not take it.
 */
function getWebBleBinding() {
    const binding = api.webble.getInstance()
    try {
        if (hasFeature('webble-known-names'))
            binding?.setKnownDeviceNames?.(getKnownDeviceNames())
    }
    catch (err) {
        // the list is an optimisation, the binding works without it
        logger.logEvent({ message: 'could not hand the known device names to the WebBLE binding', error: err.message })
    }
    return binding
}

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
                        return getWebBleBinding()
                    }
                    return null
                }

                // Windows: WinRT (native BLE) is the default, stable path. WebBLE can be
                // opted into per user via the WEBBLE_WINDOWS setting, to canary-test it as
                // a lower-complexity replacement without risking the default path for
                // everyone. Falls through to the regular ble path below if the desktop
                // build doesn't announce the webble capability.
                if (platform==='win32' && hasFeature('webble') && useAppState().hasFeature('WEBBLE_WINDOWS')) {
                    return getWebBleBinding()
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