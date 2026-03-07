import { hasFeature,isElectron,isReactNative } from '../../utils'
import { getDesktopCryptoBinding } from './desktop'
import CryptoWebBinding from './browser'
import CryptoMobileBinding from './mobile'




export const getCryptoBinding = ()=> {

    if (isElectron() && hasFeature('appSettings')) 
        return getDesktopCryptoBinding()
    if (isReactNative()) {
        return CryptoMobileBinding.getInstance()        
    }
    return  CryptoWebBinding.getInstance()
}
