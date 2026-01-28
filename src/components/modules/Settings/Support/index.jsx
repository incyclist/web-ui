import React, { useEffect, useState } from "react"
import { UserSettingsService } from "incyclist-services"
import { SupportAreaView } from "./component"
import packageInfo from '../../../../../package.json'
import AppInfoBinding from "../../../../bindings/app-info"

export const SupportArea = ({user})=> {




    const [uuid,setUuid] = useState(undefined)
    const [appVersion,setAppVersion] = useState(undefined)
    const [reactVersion,setReactVersion] = useState(undefined)
    

    useEffect( ()=>{
        const userSettings = UserSettingsService.getInstance()
        

        if (!uuid) {
            try {
                setUuid(userSettings.get('uuid'))
            }
            catch(err) {

            }
        }
        if (!appVersion) {
            const appInfo = AppInfoBinding.getInstance().getAppInfo()
            setAppVersion(appInfo.version)
        }

        if(!reactVersion) {
            setReactVersion(packageInfo.version)
        }


    },[appVersion, reactVersion, uuid])




    const props={uuid,appVersion,reactVersion}
 
    return <SupportAreaView {...props}/>

}