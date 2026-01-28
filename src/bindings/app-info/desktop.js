import { api } from '../../utils/electron/integration';


export class IncyclistAppBinding {

    getOS() {
        return api.appSettings.getOSSync();
    }

    // {version,name,appDir,sourceDir,tempDir, session} 
    getAppInfo() {
        return api.appSettings.getAppInfo();
    }

    isApp() {
        return true;
    }

    getChannel() {
        return 'desktop';
    }

    get session() {
        return api.appSettings.session
    }

}
