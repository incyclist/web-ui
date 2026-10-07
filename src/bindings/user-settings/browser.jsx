import { UserSettingsBinding } from "incyclist-services";

const ROUTE_FAVORITES_KEY = 'incyclist.routeFavorites'

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
        // Keep route bookmarks across browser sessions without changing the lifetime
        // of other settings (which may contain account/session information).
        try {
            const favorites = JSON.parse(window.localStorage.getItem(ROUTE_FAVORITES_KEY))
            if (Array.isArray(favorites) && favorites.every(id => typeof id === 'string')) {
                this.settings.routes = { ...this.settings.routes, favorites }
            }
        } catch { /* Storage may be disabled or contain malformed data. */ }
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
            if (Array.isArray(settings.routes?.favorites)) {
                window.localStorage.setItem(ROUTE_FAVORITES_KEY, JSON.stringify(settings.routes.favorites))
            }
                
            return true
    }
        catch ( err) {
            this.logger.logEvent({message:'error',fn:'save()',error:err.message})
            return false;
        }        
    }

    

}
