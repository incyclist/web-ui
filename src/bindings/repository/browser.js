
export class RepositoryWebBinding  {
    static _instance;
    
    static getInstance() {
        if (!RepositoryWebBinding._instance)
            RepositoryWebBinding._instance = new RepositoryWebBinding()
        return RepositoryWebBinding._instance
    }

    
    constructor() {
        this.sessionStorage = window.sessionStorage
        this.repositories = {}
    }

    async create(name) {
        const repoKey = name

        const repo = {
            repoKey, 
            read: async (resource)=>{ return await this.read(name,resource)},
            write: async (resource,data)=>{ return await this.write(name,resource,data)},
            delete:  async (resource)=>{ return await this.delete(name,resource)},
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

    async release(name) {
        delete this.repositories[name]
        return true;
    }

    async read(repoName,resourceName){

        const repo= this.get(repoName)
        const key = `${repoName}.${resourceName}`

        await this.waitForPrevWriteToFinish(repo);

        try {
            const str = this.sessionStorage.getItem(key)
            const data = JSON.parse(str)
            return data;
        }
        catch(err) {
            console.log(`read(${repoName},${resourceName})`,err)
            return null;
        }

    }

    async delete(repoName,resourceName){

        const repo= this.get(repoName)

        await this.waitForPrevWriteToFinish(repo);

        const key = `${repoName}.${resourceName}`

        this.sessionStorage.removeItem(key)

        return await this.write(repoName,resourceName,{})
    }

    async write(repoName,resourceName,data){
        const repo= this.get(repoName)

        await this.waitForPrevWriteToFinish(repo);

        const key = `${repoName}.${resourceName}`


        const promise = new Promise (async done=> {
           
            try {                
                sessionStorage.setItem(key, JSON.stringify(data))
                done(true)
            }
            catch {
                done(false)
            }

        })
        repo.writeState = {promise}
        
        
        const success = await promise
        delete repo.writeState
        return success        

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