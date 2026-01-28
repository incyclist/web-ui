import React from 'react';
import {Popup} from 'react-leaflet';
import { useAppUI } from '../../../../bindings/native-ui';


export const ScreenshotPopup = ({screenshot}) => {

    const app = useAppUI()

    const open = () => {       
        if (!screenshot?.fileName)
            return;
        app.showItemInFolder(screenshot.fileName)    
    }

    
    if ( !screenshot) 
        return (<div/>)

    const {fileName} = screenshot;
    return (
        <Popup>
            <div style={{width:'300px', height:'100%'}}>
                <img style={{width:'100%', height:'100%'}} src={`incyclist:///${fileName}`} alt={fileName} onClick={open}>
            </img> </div>
        </Popup>
    )

    

}

