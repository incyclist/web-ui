import EventEmitter from 'events'
import { getBindings } from 'incyclist-services'

export class DualFileReader extends FileReader {
    constructor() {
        super();
        this.files = [];
        this.errors = [];
    }

    _checkDone() {
        let cntTotal = this.files.length+this.errors.length;
        let cntSuccess = this.files.length;

        if ( cntTotal ===2) {
            if ( cntSuccess===2) {
                if (this.onLoadDone!==undefined) {
                    this.onLoadDone( [
                        { data:this.files[0].target.result, format:this.files[0].target.format, name:this.files[0].target.name },
                        { data:this.files[1].target.result, format:this.files[1].target.format, name:this.files[0].target.name }
                    ]);
                }
                this.files = [];
                this.errors = [];
        
            }
            else {
                if (this.onLoadError!==undefined) {
                    this.onLoadError(this.errors);
                }
                this.files = [];
                this.errors = [];
                
            }
        }

    }

    onLoad(readerEvent) {
        this.files.push(readerEvent);
        this._checkDone();
    } 

    onError(readerEvent) {
        this.errors.push(readerEvent);
        this._checkDone();
    }

    loadFile(file) {

        let parts = file.name.split('.');
        if (parts.length<2 )
            return;
        let format = parts[ parts.length-1].toUpperCase();
        if ( format==="EPM" ) {
            let reader = new FileReader();
            reader.format = format;
            reader.name = file.name;
            reader.onload = this.onLoad.bind(this);
            reader.onerror = this.onError.bind(this);
            reader.readAsText(file ,'UTF-8');
        }
        else if ( format==="EPP" ) {
            let reader = new FileReader();
            reader.format = format;
            reader.name = file.name;
            reader.onload = this.onLoad.bind(this);
            reader.onerror = this.onError.bind(this);
            reader.readAsBinaryString( file ,'UTF-8');
        }
        else {
            this.onError( "not allowed")
        }
        
    }

}


export class FileLoader   {

    _instance;
    static getInstance() {
        if (!FileLoader._instance)
            FileLoader._instance = new FileLoader()
        return FileLoader._instance;

    }

    initReader(context) {
        this.initSingleReader( context)    
        this.initDualReader( context)
    }
 
    initSingleReader( context) {

        context.reader = new FileReader();

        // here we tell the reader what to do when it's done reading...
        context.reader.onload = (readerEvent) => {
            var content = readerEvent.target.result; // this is the content!
            context.emitter.emit('single',content)
        }

        context.reader.onerror  = readerEvent => {
            const error = readerEvent
            context.emitter.emit( 'error',error)
        }
        context.reader.loadFile = (file) => {

            context.reader.fileName = file.name;
            context.reader.readAsText(file ,'UTF-8');

        }
    }

    initDualReader( context) {
        const prio = (format) => {
            if (format==='EPM')
                return 2
            if (format==='EPP')
                return 1
            return 0
        }
        this.dualFileReader = new DualFileReader();
        this.dualFileReader.onLoadDone = ( infos ) => {
            const sorted = infos.sort( (a,b)=> prio(b.format)-prio(a.format) )
            context.emitter.emit('dual', [sorted[0].data, sorted[1].data])
        }
        this.dualFileReader.onLoadError = ( errors ) => {} 
    }


    // returns a Promise<{ error:ErrorInfo|null, content }
    async open(info) {

        let data;

        if (info.type === 'url') {
            try {
                const response = await fetch(info.url);
                if (!response.ok) {
                    return { error: `Could not open file: ${response.status} ${response.statusText}` };
                }

                const contentType = response.headers.get('content-type') || '';

                if (info.encoding === 'binary') {
                    const arrayBuffer = await response.arrayBuffer();
                    // convert ArrayBuffer to Buffer
                    const buf = Buffer.from(arrayBuffer);
                    // keep same behavior as previous implementation
                    const hex = buf.toString('hex');
                    data = Buffer.from(hex, 'hex');
                } else {
                    if (contentType.includes('application/json')) {
                        const json = await response.json();
                        data = JSON.stringify(json);
                    } else {
                        data = await response.text();
                    }
                }

                return { data };
            } catch (e) {
                return { error: 'Could not open file' };
            }
        }


        // a scanned/picked route file on desktop: {type:'file', dir, name, ext, filename, delimiter} -
        // read via the platform's real filesystem binding, the same way mobile's own loader does
        // for its (structurally identical) 'file' case, rather than through a browser File object.
        if (info.type==='file' && !info.file) {
            try {
                const path = info.filename ?? `${info.dir}${info.delimiter??'/'}${info.name}${info.ext?`.${info.ext}`:''}`
                data = await getBindings().fs.readFile(path, info.encoding==='binary' ? undefined : 'utf8')
                return { data }
            }
            catch (err) {
                return { error: err?.message ?? 'Could not open file' }
            }
        }

        // Dropzone's fallback for environments without Electron file-path support: info.file is a
        // raw browser File object (or two, for a route + its EPP companion), read via FileReader.
        return new Promise( resolve => {

            if (info.type!=='file' || !info.file) {
                resolve({error:'Internal Error', key:'invalid_srctype'})
                return
            }

            const context = {
                info,
                emitter: new EventEmitter()
            }

            const done =(...args) => {
                context.emitter.removeAllListeners()
                resolve(...args)
            }

            this.initReader(context)
            context.emitter.once('single',(data)=>done( {data} ))
            context.emitter.on('error',(error)=>done( {error} ))
            context.emitter.on('dual',(epmEpp)=>done( {epmEpp} ))

            const files = Array.isArray(info.file) ? info.file : [info.file]
            if (files.length===1) {
                context.reader.loadFile(files[0]);
            }
            else if (files.length===2) {
                this.dualFileReader.loadFile(files[0]);
                this.dualFileReader.loadFile(files[1]);
            }
            else {
                let error = { message:'Please upload only one file', key:'too-many-files' };
                done ( { error } )
            }

        })


    }


}

export const useFileLoader = ()=> FileLoader.getInstance()