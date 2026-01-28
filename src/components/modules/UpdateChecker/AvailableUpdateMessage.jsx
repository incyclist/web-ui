import React from "react"
import {MessageBox} from '../../molecules'
import { Column, UrlLink } from "../../atoms"


export const AvailableUpdateMessage = ( {version,url,downloadUrl,onSkip} ) => {
    return (

    <MessageBox title='Update available' no='Skip' defaultButton='no' onNo={onSkip} center  noYes>        
        <Column>
            Please update your app to the latest version {version}<br/>
            <p>You can download the version  <UrlLink text='here' url={downloadUrl??url} onOpened={onSkip}/></p>
            <p>After download, this version needs to be manually installed. </p>
        </Column>
    </MessageBox>

)}