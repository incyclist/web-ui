import { useUserSettings } from 'incyclist-services';
import {EventLogger} from 'gd-eventlog'
import { api, hasFeature } from '../../utils/electron/integration';
import { usePath,fs, AppInfoBinding } from '..';

export class RepositoryAppBinding  { // implements extends AbstractJsonRepositoryBinding
    static _instance; 
    
    static getInstance() {
        if (!RepositoryAppBinding._instance)
            RepositoryAppBinding._instance = new RepositoryAppBinding()
        return RepositoryAppBinding._instance
    }

    
    constructor() {
        
        const { appDir } = AppInfoBinding.getInstance().getAppInfo();
        this.baseDir = appDir;
        this.repositories = {}
        this.logger  = new EventLogger('Repository')
    }

    getRepoFromUserSettings(name) {
        try {
            const repo =  useUserSettings().get(`repo.${name}`)
            return repo
        }
        catch(err) {
            return null;
        }

    }

    getPath(name) {
        const path = usePath()
        return this.getRepoFromUserSettings(name) || path.join( this.baseDir, name);        
    }

    async create(name) {

        const repoDir = this.getPath(name)
        const status = await fs.ensureDir(repoDir);

        const repo = {
            status,
            repoDir, 
            read: async (resource)=>{ return await this.read(name,resource)},
            write: async (resource,data)=>{ return await this.write(name,resource,data)},
            delete:  async (resource)=>{ return await this.delete(name,resource)},
            list: async()=>{ return await this.list(name)}
        }
        this.repositories[name] = repo
        return repo
        
    }

    async get(name) {
        const repo = this.repositories[name]
        if (!repo)
            return null
        return repo
    }

    async list(name) {
        const path = usePath()
        const repoDir = this.getRepoFromUserSettings(name) || path.join( this.baseDir, name);        

        const names = await fs.readdir(repoDir)   
        return names
    }
 
    async release(name) {
        delete this.repositories[name]
        return true;
    }

    async read(repoName,resourceName){

        const path = usePath()
        const repo= await this.get(repoName)
        const fileName = path.join(repo.repoDir, `${resourceName}.json`)


        await this.waitForPrevWriteToFinish(repo);

        try {
            const str = await fs.readFile(fileName,  {encoding:'utf8',flag:'r'})
            return JSON.parse(str)
        }
        catch(err) {
            return null;
        }

    }

    async delete(repoName,resourceName){

        if (hasFeature('fileSystem.unlink')) {
            const repo= await this.get(repoName)
            const path = usePath()
            const fileName = path.join(repo.repoDir, `${resourceName}.json`)
            return await api.fs.unlink(fileName)
            
        }
        // not yet implemented in App
        // workaround: write empty file

        return await this.write(repoName,resourceName,{})
    }

    async write(repoName,resourceName,data){
        if (data===undefined)
            return;

        const repo= await this.get(repoName)
        const path = usePath()
        await this.waitForPrevWriteToFinish(repo);

        const fileName = path.join(repo.repoDir, `${resourceName}.json`)

        const promise = new Promise (async done=> {
            const str = JSON.stringify(data)
            const bytes = str.length
            let tryNo = 0,writeOK=false, written
            let bytesWritten;
            
            try {                
                while (tryNo<3 && !writeOK) {
                    await fs.writeFile(fileName, str, {encoding:'utf8',flag:'w'})
                    written = await fs.readFile(fileName,  {encoding:'utf8',flag:'r'})
                    bytesWritten = written.length

                    writeOK =  (bytesWritten===bytes) 
                    if (!writeOK)
                        tryNo++
                }

                if (!writeOK) {
                    const logInfo = {repo:repoName, resource:resourceName,bytes,bytesWritten}
                    this.logger.logEvent({message:'error', fn:'write', ...logInfo, error:'could not write all bytes'})
                    done(false)
                    return
                }

                JSON.parse(written)
                done(true)
            }
            catch (err) {
                const logInfo = {repo:repoName, resource:resourceName,bytes,bytesWritten}
                if ( bytes<100) logInfo.data = str

                this.logger.logEvent({message:'error', fn:'write', ...logInfo, error:err.message, stack:err.stack})
                done(false)
            }

        })


        repo.writeState = {promise}       
        try {
            const success = await promise
            delete repo.writeState
            return success        
        }
        catch(err) {
            delete repo.writeState
            this.logger.logEvent({message:'error', fn:'write',  error:err.message, stack:err.stack})
            return false
        }

    }

    async waitForPrevWriteToFinish(repo) {
        if (repo.writeState) {
            try {
                await repo.writeState.promise;
            }
            catch { }
        }
    }

}