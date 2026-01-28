import {EventLogger} from 'gd-eventlog'
import { usePath,fs, AppInfoBinding } from '..';
import { RepositoryAppBinding } from './desktop';

export class RepositoryMobileBinding  extends RepositoryAppBinding{
    static _instance; 
    
    static getInstance() {
        if (!RepositoryMobileBinding._instance)
            RepositoryMobileBinding._instance = new RepositoryMobileBinding()
        return RepositoryMobileBinding._instance
    }

    
    constructor() {
        super()

        const { appDir } = AppInfoBinding.getInstance().getAppInfo();
        this.baseDir = appDir;
        this.repositories = {}
        this.logger  = new EventLogger('Repository')
    }


    async delete(repoName,resourceName){
        const repo= await this.get(repoName)
        const path = usePath()
        const fileName = path.join(repo.repoDir, `${resourceName}.json`)
        return await fs.unlink(fileName)
    }

}