import os from 'os';
import { v4 as createSession } from 'uuid';

// NodeJS Binding.
// Binding to be used for Web page running inside IncyclistApp

export class NodeJSBinding {

    constructor() {
        this.session = createSession();
    }

    getOS() {
        const arch = os.arch();
        const platform = os.platform();
        const release = os.release();

        const res = { platform, arch, release };
        return res;
    }

    getAppInfo() {
        return {
            name: 'Incyclist',
            version: '1.0',
            session: this.session,
            appDir: os.tmpdir(),
            tempDir: os.tmpdir(),
            sourceDir: __dirname
        };
    }

    isApp() {
        return false;
    }

    getChannel() {
        return 'desktop';
    }



}
