export class BrowserBinding {
    writeFile(...args) {
        return;
    }

    readFile(...args) {
        return null;
    }

    unlink(path) {
        return;
    }

    existsSync(path) {
        return false;
    }

    mkdirSync(path) {
        return true;
    }

    checkDir(path) {
        return;
    }

    async existsFile(path) {
        return this.existsSync(path)        
    }
    async existsDir(path) {
        return this.existsSync(path)        
    }

    async mkdir(path) {
        return this.mkdirSync(path)

    }
    async ensureDir(path) {
        return this.checkDir(path)
    }


    async readdir() {
        return null;
    }
}
