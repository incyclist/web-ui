import { sleep } from "../../utils";
import { hasFeature, api } from "../../utils/electron/integration";
import { useOnlineStatusMonitoring } from "incyclist-services";

export class AppBinding {

    async writeFile(...args) {
        if (!hasFeature('ipc-samems-fix')) { // ipc was using time(in ms) as request id, we cannot do multiple within one ms
            while (Date.now() === this.prevWriteTs) {
                await sleep(2);
            }
        }
        this.prevWriteTs = Date.now();
        return await api.fs.writeFile(...args);
    }

    async readFile(...args) {
        if (!hasFeature('ipc-samems-fix')) { // ipc was using time(in ms) as request id, we cannot do multiple within one ms
            while (Date.now() === this.prevReadTs) {
                await sleep(2);
            }
        }

        this.prevReadTs = Date.now();
        return await api.fs.readFile(...args);
    }

    async unlink(path) {
        if (!hasFeature('ipc-samems-fix')) { // ipc was using time(in ms) as request id, we cannot do multiple within one ms
            while (Date.now() === this.prevUnlinkTs) {
                await sleep(2);
            }
        }
        this.prevUnlinkTs = Date.now();
        return await api.fs.unlink(path);

    }

    existsSync(path) {
        return api.fs.existsSync(path);
    }

    mkdirSync(path) {
        return api.fs.mkdirSync(path);
    }

    checkDir(path) {
        return api.fs.checkDir(path);
    }

    async readdir(path, options) {
        if (!hasFeature('fileSystem.readdir'))
            return null;
        return await api.fs.readdir(path, options);
    }

    async existsFile(path) {
        try {
            await this.access(path)
            return true
        }
        catch {
            return false
        }
    }
    async existsDir(path) {
        try {
            await this.access(path)
            return true
        }
        catch {
            return false
        }
    }

    async mkdir(path) {
        return this.mkdirSync(path)

    }
    async ensureDir(path) {
        return this.checkDir(path)
    }


    async access(path,mode) { 
        if (hasFeature('fileSystem.access')) {
            return await api.fs.access(path,mode)
        }
        else if (hasFeature('fileSystem')) {

            // don't wait synchronously if we are offline, the file might be on a network folder
            // which then would block the app from responding
            if (!useOnlineStatusMonitoring().onlineStatus) 
                throw new Error('File does not exist '+path)

            const exists = this.existsSync(path)            
            if (exists)
                return
            throw new Error('File does not exist '+path)
        }
    }



}
