import React from "react"
import NativeUiService from "../../../../services/app/native-ui";
import { Button } from "../Button";


export const GetVideoButton = ({url}) =>{


    const ui = NativeUiService.getInstance()

    const onButtonClick = () => {
        ui.openBrowserWindow(url)
    }

    
    if (!url)
        return null;

    return <>
        <Button primary={true} fontSize='1.6vh' height='3.2vh'text='Go to Full Video' onClick={onButtonClick} />
        </>
    

}
