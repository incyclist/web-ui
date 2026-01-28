import { api, hasFeature } from "../../utils/electron/integration";
import { SECRETS } from "./config";

export * from './config'

export class SecretsBinding  {
    static _instance;
    
    static getInstance() {
        if (!SecretsBinding._instance)
        SecretsBinding._instance = new SecretsBinding()
        return SecretsBinding._instance
    }

    constructor() {
        this.secrets = {}
    }

    async init() {
        for (const element of SECRETS) {
            await this.loadSecret(element)
        }
    }

    getSecret(key) {
        return this.secrets[key]
    }

    async loadSecret(key) {
        if (hasFeature('appSettings.secret.v2')) { 
            const secret = await api.appSettings.getSecret(key)

            if (secret)
                this.secrets[key] = secret
            return secret
        }
    }


}

    