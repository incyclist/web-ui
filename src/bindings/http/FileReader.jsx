import EventEmitter from 'events'

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
            context.emit('single',content)
        }

        this.reader.onerror  = readerEvent => {
            const error = readerEvent
            context.emit( 'error',error)
        }
        this.reader.loadFile = (file) => {
            
            this.reader.fileName = file.name;
            this.reader.readAsText(file ,'UTF-8');

        }
    }

    initDualReader( context) {
        const prio = (format) => {
            if (format==='EPM')
                return 2
            if (format==='EPM')
                return 1
            return 0
        }
        this.dualFileReader = new DualFileReader();
        this.dualFileReader.onLoadDone = ( infos ) => {
            const sorted = infos.sort( (a,b)=> prio(b.format)-prio(a.format) )
            context.emitter.emit('dial', [sorted[0].data, sorted[1].data])
        }
        this.dualFileReader.onLoadError = ( errors ) => {} 
    }


    // returns a Promise<{ error:ErrorInfo|null, content }
    async open(info) {

        console.log('FileReader open'+info)
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


        return new Promise( resolve => {

            if (info.ext && this.props.filters ) {
                if ( !this.checkExtension(info.ext,this.props.filters)) {
                    const exts = this.getSupportedExtensions().reduce((p,c) => `${p},${c}` )
                    this.logger.logEvent({message:'Unsupported file type',ext:info.ext,supported:exts})
                    throw new Error(`Unsupported file type - Supported type(s): ${exts}` )
                }
            }


            if (info.type!=='file') {                
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
    
            if (info!==undefined && info.length===1) {
                this.reader.loadFile(info[0]);        
            }
            else if (info!==undefined && info.length===2) {
                this.dualFileReader.loadFile(info[0]);
                this.dualFileReader.loadFile(info[1]);
            }
            else {
                let error = { message:'Please upload only one file', key:'too-many-files' }; 
                done ( { error } )
            }
    
        })


    }


}

export const useFileLoader = ()=> FileLoader.getInstance()