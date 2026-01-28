import { hasFeature,isElectron,isReactNative } from "../../utils"

import { RepositoryAppBinding } from "./desktop"
import { RepositoryWebBinding } from "./browser"
import { RepositoryMobileBinding } from "./mobile"

export const getRepositoryBinding = ()=> {


    if (isElectron() && hasFeature('appSettings'))  
        return  RepositoryAppBinding.getInstance() 
    else if (isReactNative()) {
        
        return RepositoryMobileBinding.getInstance()    
    }
    else if ( window)   
        return RepositoryWebBinding.getInstance()    
}