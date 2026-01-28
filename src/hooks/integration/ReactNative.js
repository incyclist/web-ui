import EventEmitter from 'events'
import {EventLogger} from 'gd-eventlog'

export class ReactNativeSupport {

    static _instance

    static getInstance() {
        if (!ReactNativeSupport._instance)
            ReactNativeSupport._instance = new ReactNativeSupport()
        return ReactNativeSupport._instance
    }
    
    constructor() {
        this.msgKey = 0
        this.emitter = new EventEmitter()
        this.features = []
        this.debug = false
        
    }

    async init() {
        this.features = window?.ReactNativeFeatures??[]
        this.logger = new EventLogger('RN')

        if (this.debug)  {
            this.logger.logEvent({message:'React Native was initialized'})
        }


        const handleEvent = (event) => {
            if (this.debug)
                this.logger.logEvent({message:'UI got event', payload:event?.data, isResponse: event.data.startsWith('rn-message:')})

            if (event.data.startsWith('rn-message:')) {
                try {
                    const parts = event.data.split(':')        
                    const key = parts[1]
                    const payload = parts.slice(2).join(':')
                    this.emitter.emit(key,payload)
                }
                catch(err) {
                    this.logger.logEvent({message:'error',error:err.message})
                }
            }

        }
        
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid)
            document.addEventListener('message', handleEvent)
        else 
            window.addEventListener('message', handleEvent,true)
        
        this.os = await this.sendMessage('getOsInfo')
        this.appInfo = await this.sendMessage('getAppInfo')


        
    }

    sendMessage  (command, args) {
        return new Promise ( (resolve,reject) => {

            const data = args??{}
            const payload = {
                command, ...data, 
            }
               
            const messageKey = `${Date.now()}.${this.msgKey++%10000}`
            payload.key =  `rn-message:${messageKey}`

            if (this.logger && this.debug)
                this.logger.logEvent({message:'ui sending message', payload:JSON.stringify(payload)})

            window.ReactNativeWebView.postMessage(JSON.stringify(payload))

            this.emitter.once( messageKey , (response)=> {

                if ( (response.startsWith('{') && response.endsWith( '}')) 
                        || (response.startsWith('[') && response.endsWith( ']'))) {

                    try {
                        resolve(JSON.parse(response))
                    }
                    catch(err) {
                        reject( new Error('Illegal response'))
                    }
                }
                else resolve (response)
            })
    
        })
    }

    sendNoResponseMessage  (command, data) {

        const payload = {
            command, ...data, 
        }  
        
        window.ReactNativeWebView.postMessage(JSON.stringify(payload))
    }

    hasFeature(feature)  {
        
        return this.features.includes(feature)
        
    }

    getOS() {   
        return this.os
    }

    getAppInfo() {
        if (!this.appInfo)
             this.sendMessage('getAppInfo').then(appInfo => this.appInfo=appInfo).catch()            
        return this.appInfo
    }

    debugLog(message, ...args) {
        let event = { message, ts:new Date().toISOString() }
        if (args?.length)
            event.message += ' '+args.join(',')
        this.log('debug',event)
    }

    log( context, event) {
        const payload = { command:'log-message', context, event }

        window.ReactNativeWebView.postMessage(JSON.stringify(payload))

    }

}

export const useReactNative = ()=> { return ReactNativeSupport.getInstance()}

