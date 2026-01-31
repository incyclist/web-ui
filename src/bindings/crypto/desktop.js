import { api,hasFeature } from "../../utils";
import crypto from 'crypto'

class Hash {

    constructor(id) {
        this.id = id
    }

    update(data, inputEncoding) { 
        if (hasFeature('crypto.hash')) {
            
            if (typeof data !== 'string') { 
                const b = Buffer.from(data)                
                api.crypto.hash.update(this.id,  b.toString('hex'), 'hex')
            }
            else {
                api.crypto.hash.update(this.id,  data, inputEncoding)
            }
            return this
        }
    }

    copy(options) { 
        if (hasFeature('crypto.hash')) {
            const newId = api.crypto.hash.copy(this.id, options)
            return new Hash(newId)
        }
    }

    digest(encoding) { 
        if (hasFeature('crypto.hash')) {
            const result = api.crypto.hash.digest(this.id, encoding)
            return result
        }
    }

}

export default class CryptoAppBinding {
    static _instance;
    
    static getInstance() {

        if (!CryptoAppBinding._instance)
            CryptoAppBinding._instance = new CryptoAppBinding()
        return CryptoAppBinding._instance
    }

    randomBytes(size) {
        if (hasFeature('crypto.randomBytes')) {
            const bytes = api.crypto.randomBytes(size)
            return bytes
        }

        const bytes =  crypto.randomBytes(size)
        return bytes
    }

    createHash(algorithm) {
        if (hasFeature('crypto.createHash')) {
            const id = api.crypto.createHash(algorithm)
            const hash = new Hash(id)
            return hash
        }
    }

}