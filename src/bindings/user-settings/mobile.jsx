import { UserSettingsBinding } from "incyclist-services";
import { useReactNative } from "../../hooks/integration/ReactNative";
import {EventLogger} from 'gd-eventlog'

export default class UserSettingsMobileBinding extends UserSettingsBinding {
    static _instance;  
    static getInstance() {
        if (!UserSettingsMobileBinding._instance)
            UserSettingsMobileBinding._instance = new UserSettingsMobileBinding()
        return UserSettingsMobileBinding._instance
    }

    constructor() {
        super()
        this.settings = {}
        this.rn = useReactNative()
        this.logger = new EventLogger('UserSettings')
        
    }

    async getAll() {
        const {settings} = await this.rn.sendMessage('us-getAll')
        this.settings = settings
        return this.settings
    }

    canOverwrite() {
        return true
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
            const success = await this.rn.sendMessage('us-save', {settings})
            return success
        }
        catch ( err) {
            this.logger.logEvent({message:'error',fn:'save',error:err.message})
            return false;
        }        
    }


    

}