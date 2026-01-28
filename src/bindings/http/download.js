import { hasFeature,api, isElectron, isReactNative } from '../../utils';

export default class DownloadManager {

    static _instance = null;

    static getInstance(legacy) {
        if ( !DownloadManager._instance ) {
            DownloadManager._instance = new DownloadManager(legacy);
        }
        return DownloadManager._instance;
    }

    constructor(legacy) {
        this.downloads = [];
        this.legacy = legacy

    }

    createSession(url,fileName,props={}) {
        const id = Date.now();
        
        if ( isElectron() && hasFeature('downloadManager')) {
            return api.downloadManager.createSession(id,url,fileName,props)
        }
        else if ( isReactNative()) {
            // TODO
        }
        else { // browser and legacy app
            return null
        }
    }

    isDownloadSupported() {
        return ( (isElectron() && hasFeature('downloadManager')) || isReactNative()) 
    }

}

export const useDownloadManager = (legacy)=> DownloadManager.getInstance(legacy);
