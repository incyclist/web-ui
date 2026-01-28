import { ConsoleAdapter, EventLogger } from "gd-eventlog"
import { hasFeature, isElectron, isReactNative } from "../../utils"
import ElectronLogAdpater from "./desktop"
import ReactNativeLogAdpater from "./mobile"

export const getLogBinding = ()=> {

    if (isElectron() && hasFeature('appSettings')) 
        return {
            createAdapter: (props) => { return new ElectronLogAdpater(props)},
            EventLogger
        }
    if (isReactNative()) {
        return {
            createAdapter: (props) => { return new ReactNativeLogAdpater(props)},
            EventLogger

        }
    }

    return {
        EventLogger,
        createAdapter: (props) => {return new ConsoleAdapter(props)}
    }


    

 }
