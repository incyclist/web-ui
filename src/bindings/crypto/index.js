import { hasFeature,isElectron,isReactNative } from '../../utils'
import CryptoAppBinding from './desktop'
import CryptoWebBinding from './browser'
import CryptoMobileBinding from './mobile'




export const getCryptoBinding = ()=> {

    if (isElectron() && hasFeature('appSettings')) 
        return CryptoAppBinding.getInstance() 
    if (isReactNative()) {
        return CryptoMobileBinding.getInstance()        
    }
    return  CryptoWebBinding.getInstance()
}
