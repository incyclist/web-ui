
import { hasFeature, isElectron, isLegacyElectron, legacyApi,isReactNative } from "../../utils";
import { LegacyBinding } from "./legacy";
import { BrowserBinding } from "./browser";
import { AppBinding } from "./desktop";
import { MobileBinding } from './mobile';


export default class FileSystem {
    static _instance;

    static getInstance() {
        if (!FileSystem._instance)
            FileSystem._instance = new FileSystem()
        return FileSystem._instance;
    }

    getBinding() {
        
        if (this.binding) {
            return this.binding
        }

        if ( isElectron() && hasFeature('fileSystem')) {
            this.bindingStr = "features"
            this.binding = new AppBinding()
        }        
        else if (isLegacyElectron() && legacyApi.getPath) {
            this.bindingStr = "legacy"
            this.binding = new LegacyBinding()
        }
        else if (isReactNative()) {
            this.bindingStr = "mobile"
            this.binding = new MobileBinding()
        }
        else if (window) {
            this.bindingStr = "browser"
            this.binding = new BrowserBinding()
        }
        else  {
            // import { promises as NodeFS} from 'fs'
            
            // this.bindingStr = "node"
            // this.binding = NodeFS;

            // if (!this.binding) {
            //     this.binding = new BrowserBinding()                
            // }
        }
        return this.binding
    }


    async writeFile(...args) {
        return  await this.getBinding().writeFile(...args)       
    }

    async readFile(...args) {
        return  await this.getBinding().readFile(...args)       
    }

    async appendFile(...args) {
        return  await this.getBinding().appendFile(...args)       
    }

    async unlink(path) {
        if (this.bindingStr==='features' && !hasFeature('fileSystem.unlink')) {
            try {
                const legacyBinding = new LegacyBinding();
                return await legacyBinding.unlink( path)
            }
            catch (err) {
                console.log('~~~ fs.unlink failed', err)
                return                
            }
            

        }
        return  await this.getBinding().unlink(path)
        
    }
    
    async deleteFile(path) {
        return  await this.unlink(path)
    }
 
    existsSync(path) {
        if (this.bindingStr==='node') {
            const fs = require('fs')
            return fs.existsSync ? fs.existsSync(path) : false
        }
        return  this.getBinding().existsSync(path)
    }

    checkDir(path) {
        const binding = this.getBinding()

        if (this.bindingStr!=='features'  ) {
            try {
                if (!binding.existsSync(path)){
                    binding.mkdirSync(path);
                }
                return true;    
            }
            catch (e) {
                return false
            }            
        }
        return  this.getBinding().checkDir(path)
    }

    readdir(path,options) {
        return  this.getBinding().readdir(path,options)
    }


    async ensureDir(path) {

        if (this.bindingStr==='node') { 
            // TODO
        }

        return await this.getBinding().ensureDir(path)
    }

    async existsFile(path) {
        if (this.bindingStr==='node') { 
            try {
                await NodeFS.stat(path)
                return true
            }
            catch {
                return false
            }
            
        }

        return await this.getBinding().existsFile(path)
        
    }
    async existsDir(path) {

        if (this.bindingStr==='node') { 
            try {
                await NodeFS.stat(path)
                return true
            }
            catch {
                return false
            }
        }

        return await this.getBinding().existsDir(path)        
    }

    async mkdir(path) {
        return await this.getBinding().mkdir(path)
    }




}

export const fs = FileSystem.getInstance()