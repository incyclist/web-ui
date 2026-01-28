import { hasFeature,isElectron,isReactNative } from '../../utils'
import UserSettingsAppBinding from './desktop'
import UserSettingsWebBinding from './browser'
import UserSettingsMobileBinding from './mobile'

export const getUserSettingsBinding = ()=> {

    if (isElectron() && hasFeature('appSettings')) 
        return UserSettingsAppBinding.getInstance() 
    if (isReactNative()) {
        return UserSettingsMobileBinding.getInstance()        
    }
    return  UserSettingsWebBinding.getInstance()
}
