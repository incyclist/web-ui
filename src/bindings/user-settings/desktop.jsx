import { UserSettingsBinding } from "incyclist-services";
import { sleep } from "../../utils/coding";

import {api,hasFeature} from '../../utils/electron/integration'


export default class UserSettingsAppBinding extends UserSettingsBinding {
    static _instance;

    
    static getInstance() {

        if (!hasFeature('appSettings') )
            return null;

        if (!UserSettingsAppBinding._instance)
            UserSettingsAppBinding._instance = new UserSettingsAppBinding()
        return UserSettingsAppBinding._instance
    }

    settings;

    async getAll() {
        this.settings = await api.appSettings.get()        
        return this.settings
    }

    canOverwrite() {
        return hasFeature('appSettings.overwrite')
    }

    set(key,value) {       
        if ( key===undefined || key===null || key==='') {
            throw new Error('key must be specified')
        }

        const keys = key.split('.');
        if (keys.length<2) {
            this.settings[key] =value
            return value;
        }
    
        let child = {}
        for (let index=0;index<keys.length;index++) {
            const k = keys[index];
    
            if (index===keys.length-1) {
                child[k] = value;
                return value;
            }
            else { 
                const prev = index===0? this.settings : child
                child = index===0? this.settings[k] : child[k]
                if ( child===undefined) {
                    prev[k] = child = {}
                    
                }   
            }
        
        }
    }


    async save(settings, final=false) {
        this.settings = settings;
        

        try {
            let success;
            if (this.canOverwrite()){
                success =  api.appSettings.overwrite(this.settings)
            }
            else {
                // dirty workaround for old app versions, 
                // this might conflict with a save operation happening at the same time on the main process
                // which would result in a corrupted file
                return this.overwrite(!final)
            }
            return success
        }
        catch ( err) {
            this.logger.logEvent({message:'error',fn:'<A>updateSettings()',error:err.message})
            return false;
        }        
    }

    async overwrite(sync=true) {


        if (sync || !hasFeature('fileSystem') || !hasFeature('appSettings.appInfo')) {
                    api.appSettings.save(this.settings)
        }

        if (hasFeature('fileSystem') && hasFeature('appSettings.appInfo') ) {

            while (this.overwritePromise) {
                await sleep(100)
            }

            let dataOK = false;
            let tryNo = 1;
            while (!dataOK && tryNo++<5) {
                try {
                    const str = JSON.stringify(this.settings,null,2)
                    const info = api.appSettings.getAppInfo()
                    
                    const fname = api.path.join(info.appDir,'settings.json')
                    this.overwritePromise = api.fs.writeFile(fname, str)    

                    await this.overwritePromise;

                    try {
                        const data = await api.fs.readFile(fname,'utf8');   
                        JSON.parse(data)

                        dataOK = true;
                    }
                    catch {}
                }
                catch(err) {
                    this.logger.logEvent({message:'error',fn:'overwrite()',error:err.message})
                }

            }
            this.overwritePromise = null;
            return dataOK;
        }
        
        
    }

    

}