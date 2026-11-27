import { useUserSettings } from 'incyclist-services';
import {EventLogger} from 'gd-eventlog'
import { api, hasFeature } from '../../utils/electron/integration';
import { usePath,fs, AppInfoBinding } from '..';

const isValidPath = (path) => typeof path === 'string' && path.length > 0

export class RepositoryAppBinding  { // implements extends AbstractJsonRepositoryBinding
    static _instance; 
    
    static getInstance() {
        if (!RepositoryAppBinding._instance)
            RepositoryAppBinding._instance = new RepositoryAppBinding()
        return RepositoryAppBinding._instance
    }

    
    constructor() {
        
        this.baseDir = AppInfoBinding.getInstance().getAppInfo()?.appDir;
        this.repositories = {}
        this.pathErrorLogged = {}
        this.logger  = new EventLogger('Repository')
    }

    /**
     * The app directory is looked up again as long as it is not known, so that a value that was not (yet) available when 
     * the binding was created does not stay unusable for the whole session
     */
    getBaseDir() {
        if (!isValidPath(this.baseDir)) {
            try {
                this.baseDir = AppInfoBinding.getInstance().getAppInfo()?.appDir
            }
            catch { /* handled by the caller */ }
        }
        return this.baseDir
    }

    getRepoFromUserSettings(name) {
        try {
            const repo =  useUserSettings().get(`repo.${name}`)
            return isValidPath(repo) ? repo : null
        }
        catch {
            return null;
        }

    }

    /**
     * @returns the directory of the repository, or null if it could not be determined
     */
    getPath(name) {
        const configured = this.getRepoFromUserSettings(name)
        if (configured)
            return configured

        const baseDir = this.getBaseDir()
        if (!isValidPath(baseDir))
            return null

        const repoDir = usePath().join( baseDir, name)
        return isValidPath(repoDir) ? repoDir : null
    }

    /**
     * Returns the directory of a repository. If it could not be determined when the repository was created, 
     * it is determined (and created) now
     */
    async getRepoDir(repo) {
        if (isValidPath(repo.repoDir))
            return repo.repoDir

        const repoDir = this.getPath(repo.name)
        if (!repoDir)
            return null

        repo.status = await fs.ensureDir(repoDir)
        repo.repoDir = repoDir
        return repoDir
    }

    async getFileName(repo, resourceName) {
        const repoDir = await this.getRepoDir(repo)
        if (!repoDir)
            return null

        const fileName = usePath().join(repoDir, `${resourceName}.json`)
        return isValidPath(fileName) ? fileName : null
    }

    // only log the types - the values are paths that contain the name of the user
    logPathError(repoName, resourceName, fn) {
        if (this.pathErrorLogged[repoName])
            return
        this.pathErrorLogged[repoName] = true

        let settingType
        try { settingType = typeof useUserSettings().get(`repo.${repoName}`) } catch { settingType = 'error' }

        this.logger.logEvent({
            message:'error', fn, repo:repoName, resource:resourceName, error:'repository path not available',
            baseDirType: typeof this.baseDir, repoDirType: typeof this.repositories[repoName]?.repoDir, settingType
        })
    }

    async create(name) {

        const repoDir = this.getPath(name)
        const status = repoDir ? await fs.ensureDir(repoDir) : false

        const repo = {
            name,
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
        const repoDir = this.getPath(name)
        if (!repoDir) {
            this.logPathError(name, undefined, 'list')
            return []
        }

        const names = await fs.readdir(repoDir)   
        return names
    }
 
    async release(name) {
        delete this.repositories[name]
        return true;
    }

    async read(repoName,resourceName){

        const repo= await this.get(repoName)
        const fileName = await this.getFileName(repo, resourceName)
        if (!fileName) {
            this.logPathError(repoName, resourceName, 'read')
            return null
        }

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

        try {
            if (hasFeature('fileSystem.unlink')) {
                const repo= await this.get(repoName)
                const fileName = await this.getFileName(repo, resourceName)
                if (!fileName) {
                    this.logPathError(repoName, resourceName, 'delete')
                    return false
                }
                return await api.fs.unlink(fileName)
                
            }
            // not yet implemented in App
            // workaround: write empty file

            return await this.write(repoName,resourceName,{})
        }
        catch(err) {
            if (err.message?.startsWith('ENOENT'))
                return true
            throw err
        }
    }

    async write(repoName,resourceName,data){
        if (data===undefined)
            return;

        const repo= await this.get(repoName)
        await this.waitForPrevWriteToFinish(repo);

        const fileName = await this.getFileName(repo, resourceName)
        if (!fileName) {
            this.logPathError(repoName, resourceName, 'write')
            return false
        }

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
                    this.logger.logEvent({message:'warning', fn:'write', ...logInfo, error:'could not write all bytes'})
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