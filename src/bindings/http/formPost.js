import { api, hasFeature } from "../../utils/electron/integration"

export class FormPostBinding {

    static _instance 
    static getInstance() {
        if (!FormPostBinding._instance)
        FormPostBinding._instance = new FormPostBinding()
        return FormPostBinding._instance
    }    

    getBinding() {
        if (hasFeature('formPost')) // Electron App
            return api.formPost
        if (window.localSupport?.getFormPost) { // Legacy Electon App
            window.localSupport.getFormPost()
        }  
        
    }

    async createForm(opts,uploadInfo) {
        return await this.getBinding().createForm(opts,uploadInfo)

    }

    async post(opts) {
        const res = await this.getBinding().post(opts)
        // bugfix in older App versions (returning result instead of data)
        return { data:res.data||res.result, error:res.error}

    }

}