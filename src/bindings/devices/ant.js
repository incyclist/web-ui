import { api, hasFeature, isElectron } from "../../utils";

export default function getAntBinding() {
    try {
        if (isElectron() && hasFeature('ant')) {
            return  api.ant.getBinding()
        }
        else { 
            return null;
        }
    }
    catch (err) {
        this.logger.logEvent({message:'error',fn:'getAntBinding()',error:err.message})
    }

}