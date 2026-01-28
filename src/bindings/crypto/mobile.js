// TODO
import crypto from 'crypto'

export default class CryptoMobileBinding {
    static _instance;

    
    static getInstance() {

        if (!CryptoMobileBinding._instance)
            CryptoMobileBinding._instance = new CryptoMobileBinding()
        return CryptoMobileBinding._instance
    }

    randomBytes(size) {
        const bytes =  crypto.randomBytes(size)
        return bytes
    }

}