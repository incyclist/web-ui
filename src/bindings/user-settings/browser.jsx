import { UserSettingsBinding } from "incyclist-services";



export default class UserSettingsWebBinding extends UserSettingsBinding {
    static _instance;
    static getInstance() {
        if (!UserSettingsWebBinding._instance)
            UserSettingsWebBinding._instance = new UserSettingsWebBinding()
        return UserSettingsWebBinding._instance
    }

    settings;

    canOverwrite() {
        return true;
    }
    
    async getAll() {
        this.settings ={}
        const sessionStorage = window.sessionStorage

        let keys = Object.keys(sessionStorage);
        for(let key of keys) {
            let data;
            try { data=JSON.parse(sessionStorage.getItem(key))} catch { data=sessionStorage.getItem(key) }            
            this.settings[key]= data
        }
        return this.settings
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

    async save(settings) {
        this.settings = settings
        try {
            const keys = Object.keys(this.settings) 
            for(let key of keys) {
                const data = this.settings[key]
                if (typeof data ==='string')
                    window.sessionStorage.setItem(key,data)
                else 
                    window.sessionStorage.setItem(key,JSON.stringify(data))
            }
                
            return true
    }
        catch ( err) {
            this.logger.logEvent({message:'error',fn:'save()',error:err.message})
            return false;
        }        
    }

    

}