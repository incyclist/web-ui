// TODO
import crypto from 'crypto'

export default class CryptoWebBinding {
    static _instance;

    
    static getInstance() {

        if (!CryptoWebBinding._instance)
            CryptoWebBinding._instance = new CryptoWebBinding()
        return CryptoWebBinding._instance
    }

    randomBytes(size) {
        const bytes =  crypto.randomBytes(size)
        return bytes
    }

}