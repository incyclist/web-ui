import { v4 as createSession } from 'uuid';
import { legacyApi } from '../../utils/electron/integration';


export class LegacyBinding {
    constructor() {
        this.session = createSession();
        this.app = legacyApi.getApp();
    }

    getOS() {
        const res = {};
        return res;
    }

    getAppInfo() {
        return {
            name: this.app.getName(),
            version: this.app.getVersion(),
            session: this.app.getSession(),
            appDir: this.app.getAppDirectory(),
            tempDir: this.app.getAppDirectory(),
            sourceDir: this.app.getSourceDir()
        };
    }

    isApp() {
        return true;
    }

    getChannel() {
        return 'desktop';
    }


}
