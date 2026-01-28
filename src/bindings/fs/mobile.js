import { useReactNative } from "../../hooks/integration/ReactNative"

export class MobileBinding {

    constructor() {
        this.rs = useReactNative()
    }

    async writeFile(file,content,options={}) {

        let data = content
        if (options.encoding==='binary' ) {            
            options.encoding = 'base64'
            data = Buffer.from(content).toString('base64')
        }
        await this.rs.sendMessage('fs-writeFile', {file,data,options})
    }

    async readFile(path,options={}) {

        let isBuffer = false
        if (!options.encoding || options.encoding==='binary') {
            isBuffer = true
            options.encoding = 'base64'
        }

        const {content} = await this.rs.sendMessage('fs-readFile', {path,options})

        if (!isBuffer)
            return content

        return Buffer.from(content,'base64')
    }

    async unlink(path) {
        await this.rs.sendMessage('fs-unlink', {path})
    }

    async existsFile(path) {
        const res =  await this.rs.sendMessage('fs-existsFile', {path})
        return res?.exists
        
    }
    async existsDir(path) {
        const res =  await this.rs.sendMessage('fs-existsDir', {path})
        return res?.exists
        
    }

    async mkdir(path,options) {
        await this.rs.sendMessage('fs-mkdir', {path})

    }


    async ensureDir(path) {
        const exists = await this.existsDir(path)
        if (!exists)
            await this.mkdir(path)

    }

    async readdir(path, options) {
        return await this.rs.sendMessage('fs-readdir', {path,options})

    }
}
