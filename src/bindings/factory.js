import { getBindings  } from "incyclist-services"
import { PathBinding } from "./path"
import { FileLoader } from "./http/FileReader"
import { VideoProcessing } from "./video"
import AppInfoBinding from "./app-info"
import { fs } from "./fs"
import DownloadManager from "./http/download"
import { SecretsBinding } from "./secrets"
import MessageQueue from "./mq"
import { FormPostBinding } from "./http/formPost"
import NativeUiService from "./native-ui"
import { getRepositoryBinding } from "./repository"
import { getCryptoBinding} from './crypto'
import { OAuthBinding } from "./oauth"
import { getUserSettingsBinding } from "./user-settings"
import { getLogBinding } from "./logging"
import { initSerialBinding } from "./devices"
import getAntBinding from "./devices/ant"
import getBleBinding from "./devices/ble"
import getDirectConnectBinding from "./devices/wifi"

export class BindingFactory {

    static initServiceBindings() {
        try {
            const bindings = getBindings()
            bindings.db = getRepositoryBinding() 
            bindings.path =PathBinding.getInstance()
            bindings.loader=FileLoader.getInstance()
            bindings.video = new VideoProcessing()
            bindings.appInfo = AppInfoBinding.getInstance()
            bindings.fs = fs
            bindings.downloadManager = DownloadManager.getInstance()
            bindings.secret = SecretsBinding.getInstance()
            bindings.mq = MessageQueue.getInstance()
            bindings.form = FormPostBinding.getInstance()
            bindings.ui = NativeUiService.getInstance()
            bindings.crypto = getCryptoBinding()
            bindings.outh = OAuthBinding.getInstance()
            bindings.settings = getUserSettingsBinding()
            bindings.logging = getLogBinding()
            bindings.serial = initSerialBinding()
            bindings.ant = getAntBinding()
            bindings.ble = getBleBinding()
            bindings.wifi = getDirectConnectBinding() 

            return bindings
            
            
          }
          catch(err) {
            console.log('~~~ DEBUG:Error',err)
          }    
    }

    

}

export const initBindings = ()=> {
    const bindings =  BindingFactory.initServiceBindings()
    bindings.secret?.init()
    return bindings
    
}