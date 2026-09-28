
import { useNavigate } from "react-router";
import { isReactNative } from "../../utils";
import { api,hasFeature } from "../../utils/electron/integration";
import LanguageDetector from "./i18n";


export const useAppUI = () => NativeUiService.getInstance()

// derives a display name from a filesystem path's basename, tolerant of both '/' and '\' separators
export function getDirectoryDisplayName(path) {
    if (!path)
        return undefined
    const parts = path.split(/[\\/]/).filter(p => p.length > 0)
    return parts.length ? parts[parts.length - 1] : path
}

/**
 * @typedef {Object} SelectDirectoryResult
 * @property {boolean} [canceled] - true if the user cancelled the directory picker
 * @property {string} [selected] - the selected directory's absolute path
 * @property {string} [displayName] - the selected directory's basename, for display purposes
 */

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
                const file = Array.isArray(files) ? files[0] : files

                if (!file?.path)
                    return ( {canceled:true} )

                return ( {selected: file.path, displayName: getDirectoryDisplayName(file.path)} )

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