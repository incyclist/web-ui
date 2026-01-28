import React, { useEffect } from "react"
import ImageBackground from "../../components/atoms/ImageBackground"
import { Loader } from "../../components/atoms"
import NativeUiService from "../../bindings/native-ui"
import { useUserSettings } from "incyclist-services"
import { sleep } from "../../utils"


export const ExitPage =  () => { 

    const userSettings = useUserSettings()
    const terminate = async (delay) => {
        if (delay)
            await sleep(2000)
        NativeUiService.getInstance().quit();
    }

    useEffect( ()=> {
        

        // TODO: Implement checks if there are ongoing downloads/conversions 
        //  if so:  ask user if he really wants to terminate

        userSettings.onAppClose().then( terminate,false)
    })

    return (
    <ImageBackground>
        <Loader size='5vh' color='white' type='clipped' />    
    </ImageBackground>
    )

}