export class LegacyBinding {

    constructor() {
        this.fs = window.localSupport.getFS();
    }

    writeFile(...args) {
        return new Promise((resolve, reject) => {
            this.fs.writeFile(...args, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    readFile(...args) {
        return new Promise((resolve, reject) => {
            this.fs.readFile(...args, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    }

    unlink(path) {
        return new Promise((resolve, reject) => {
            this.fs.unlink(path, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    existsSync(path) {
        return this.fs.existsSync(path);
    }

    mkdirSync(path) {
        return this.fs.mkdirSync(path);
    }

    checkDir(path) {
        if (!this.existsSync)
            this.mkdirSync(path);
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
