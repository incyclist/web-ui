
import { useNavigate } from "react-router";
import { isReactNative } from "../../utils";
import { api,hasFeature } from "../../utils/electron/integration";
import LanguageDetector from "./i18n";


export const useAppUI = () => NativeUiService.getInstance()

export default class NativeUiService   {

    static _instance = null;
    static getInstance() {
        if ( !NativeUiService._instance ) {
            NativeUiService._instance = new NativeUiService();
        }
        return NativeUiService._instance;
    }


    quit() {
        // legacy
        // TODO replace with app feature
        if (hasFeature('ui.quit'))
            api.ui.quit();

        else if ( window && window.localSupport && window.localSupport.getApp) {
            window.localSupport.getApp().quit();
        }
        else if (window) {
            window.close();
        }
        else {
            process.exit()
        }

    }    

    toggleFullscreen() {
        if (hasFeature('ui.toggleFullSccreen'))
            api.ui.toggleFullScreen();
        

    }

    disableScreensaver() {
        if (hasFeature('ui.screensaver')) {
            api.ui.disableScreensaver();
        }

    }

    enableScreensaver() {
        if (hasFeature('ui.screensaver')) {
            api.ui.enableScreensaver();
        }
    }


    async takeScreenshot( props = {}) {
        if ( hasFeature('ui.screenshot')) {
            return api.ui.takeScreenshot(props)
        }
        else {
            return null
        }

    }

    async openBrowserWindow( url) {
        if ( hasFeature('shell.openExternal')) {
            api.openExternal(url)
        }
        else {
            window.open(url);
        }
           
    }

    async openAppWindow( url) {
        if ( hasFeature('shell.openExternal')) {
            api.openExternal(url)
        }
        else {
            window.open(url);
        }           
    }

    async selectDirectory() {
        if (hasFeature('FileSelection.openFileDialog')) {

            try {
                const files = await api.openFileDialog({directory:true})
                if (Array.isArray(files))
                    return ( {selected: files[0].path} )
                return ( {selected: files.path} )
                
            }
            catch( err) {
                console.log( '~~~err',err)
            } 
    
        }
    }

    showItemInFolder(fileName) {
        if (hasFeature('shell.showItemInFolder')) {
            api.showItemInFolder(fileName)
        }
    }

    getPathForFile(file) {
        if (file.path)
            return file
        if (hasFeature('File.path'))
            return api.getPathForFile(file)        
        return file
    }

    detectLanguage() {

        if (isReactNative()) {
            // TODO
        }

        const detector = new LanguageDetector()
        if (detector)
            return detector.detect()
        
        return ['en']
    }

    openPage(route) {
        try {
            useNavigate().navigate(route)

        }
        catch(er) {
            
        }

    }


}