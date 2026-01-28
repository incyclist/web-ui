import { EventLogger } from "gd-eventlog";
import EventEmitter from 'events'

let _serial = undefined;
const _logger = new EventLogger('SerialBinding')


function resolveNextTick() {
    return new Promise(resolve => process.nextTick(() => resolve()))
}

export class CanceledError extends Error {    
    constructor(message) {
      super(message)
      this.canceled = true
    }
}


export const SerialLegacyBinding = { 
   
    setSerial(SerialportClass) {
        _serial = SerialportClass
    },

    /**
     * Provides a list of hosts that have port #PORT opened
     */
    async list( ) {

        if (_serial) {
            const res = await _serial.list()
            _logger.logEvent( {message:'Serial.list()', ports: res.map(info => info.path)})

            return res
        }
        
        _logger.logEvent( {message:'Serial.list()', ports:[]})
        return []
    },


    /**
     * Opens a connection to the serial port referenced by the path.
     */
    async open(options){

        if (!_serial)
            return null;


        if (!options.path)
            return null;

        /*
        const {path} = options
        const port = new _serial( path , { autoOpen:false})
        return port        

        */
        const asyncOpen = () =>  {
            return new Promise( (resolve,reject) => {

                if (!options.path)
                    return reject( new TypeError('"path" is not valid'))

                const {path} = options
                const port = new _serial( path , { autoOpen:false})

                
                port.once('timeout',()=>{ reject(new Error('timeout'))})
                port.once('error',(err)=>{ reject(err)})
                port.once('open',()=>{ resolve(port)})

                port.open()
                
            } )
        }            

        
        const port = await asyncOpen()
        return new SerialPortBinding(port);
        /*
        */
    }

}


export class SerialPortBinding  extends EventEmitter {

    constructor(port, options) {
        super()
        this.logger = new EventLogger('SerialPort')        
        this.port = port
        this.openOptions = options
        this.pendingRead = null
        this.data = null


        this.port.removeAllListeners()
        this.port.on('open', this.onOpen.bind(this))
        this.port.on('data', this.onData.bind(this))
        this.port.on('error', this.onError.bind(this))
        this.port.on('close', ()=>{this.close()})
        this.port.on('drain', this.onDrain.bind(this))   
        
        

    }

    get isOpen() {
        return this.port && this.port.isOpen
    }

    onOpen() {
        // ignore
    }

    onDrain() {
        //ignore
    }

    onData(data) {
        const buffer = Buffer.from(data)

        if (!this.data) this.data = Buffer.alloc(0)
        this.data = Buffer.concat([this.data,buffer])

        if (this.pendingRead) {
            process.nextTick(this.pendingRead)
            this.pendingRead = null
        }

        this.emit('data',data)
    }

    onError(err) {
        this.emit('error',err)

        if (this.pendingRead) {
            this.pendingRead(err)
        }

    }

    open() {
        if (this.isOpen)
            this.emit('open')
    }

    
    async close() {

        if (this.pendingRead) {
            this.pendingRead(new CanceledError('port is closed'))          
        }
        // reset data
        this.data = Buffer.alloc(0);


        if (!this.isOpen)    
            return
        
        return this.port.close()
    }


    async read(buffer, offset, length){

        if (!this.isOpen) {
            throw new Error('Port is not open')
        }
        if (!Buffer.isBuffer(buffer)) {
            throw new TypeError('"buffer" is not a Buffer')
        }
      
        if (typeof offset !== 'number' || isNaN(offset)) {
            throw new TypeError(`"offset" is not an integer got "${isNaN(offset) ? 'NaN' : typeof offset}"`)
        }
      
        if (typeof length !== 'number' || isNaN(length)) {
            throw new TypeError(`"length" is not an integer got "${isNaN(length) ? 'NaN' : typeof length}"`)
        }
      
        if (buffer.length < offset + length) {
            throw new Error('buffer is too small')
        }
      
        await resolveNextTick()

        if (!this.data || this.data.length===0) {
            return new Promise((resolve, reject) => {
                this.pendingRead = err => {
                    if (err) {
                        return reject(err)
                    }
                    
                    if (this.isOpen)                    
                        this.read(buffer, offset, length).then(resolve, reject)
                    else 
                        this.pendingRead=null
                }
            })
                          
        }
            
        const lengthToRead = length===65536 ? this.data.length : length;

        const toCopy = this.data.slice(0, lengthToRead)
        const bytesRead = toCopy.copy(buffer,offset)
        this.data = this.data.slice(lengthToRead)
        this.pendingRead = null;
        return ({buffer,bytesRead})
        
    }    

    async write(data){
        const buffer = Buffer.from(data)
        return  this.port.write(buffer)        
    }


    async update(options) {
        await this.port.update(options)
    }

    async set(options,calback){
        
        return this.port.set(options,calback)
    }
    
    async get() {
        const res = await this.port.get()
        return res;
    }    

    async getBaudRate() {
        const res = await this.port.getBaudRate()
        return res;
    }

    async flush() {        
        
        const res = await this.port.flush()
        return res;
    }
    
    async drain() {
        const res = await this.port.drain()
        return res;
    }

    pipe( destination, options) {       
        return this.port.pipe(destination,options)
    }

    unpipe() {
        return this.port.unpipe()
    }



}


