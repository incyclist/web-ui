import { EventLogger } from "gd-eventlog";

import { api, hasFeature,isReactNative } from "../../../utils";
import { TCPLegacyBinding } from "./legacy/tcpip";
import { SerialLegacyBinding } from "./legacy/serial";
import AppInfoBinding from "../../app-info";


export const initSerialBinding = () => {
    return {
        getSerialBinding
    }

}

export default function getSerialBinding(ifName) {
    const logger = new EventLogger('Incyclist')


    try {
        if (hasFeature  ('serial')) {
            logger.logEvent({message:'serial binding', interface:ifName, source:'app'})
            return  api.serial.getBinding(ifName);                   
        }
        else if ( isReactNative()) {
            return null
        }
        else if  (AppInfoBinding.getInstance().isApp()) {
            if (ifName==='serial') {
                logger.logEvent({message:'serial binding', interface:ifName, source:'app legacy'})

                const Serial= window.localSupport.getSerialport()                
                SerialLegacyBinding.setSerial(Serial)
                return SerialLegacyBinding
            }
            if (ifName==='tcpip') {
                logger.logEvent({message:'serial binding', interface:ifName, source:'tcp legacy'})

                return TCPLegacyBinding
            }
        }    
        else { // Web
            logger.logEvent({message:'serial binding', interface:ifName, source:'none'})
            return null;
        }
    }
    catch (err) {
        
        logger.logEvent({message:'error',fn:'getSerialBinding()',interface:ifName, error:err.message||err})
    }

}