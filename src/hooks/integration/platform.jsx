import { isElectron, isReactNative } from "../../utils"
import { useBindings } from "../bindings"
import { useReactNative } from "./ReactNative"

export const usePlatformIntegration = () => {
    const reactNative = useReactNative()

    const getPlatform = ()=> {
        if (isElectron())
            return 'desktop'
        if (isReactNative())
            return 'mobile/webview'
        return 'web'
    }

    useBindings()
    const platform = getPlatform()

    if (isReactNative())
        reactNative.init()



    return {platform,reactNative }
}