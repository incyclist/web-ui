import { EventLogger } from 'gd-eventlog';
import { hasFeature,api } from '../../../../utils/electron';

//import { BindingPortInterface, OpenOptions, PortStatus, PortInfo, SetOptions, UpdateOptions, BindingInterface } from "@serialport/bindings-interface";



let _logger
let _net


//export type TCPBindingInterface = BindingInterface<TCPPortBinding,TCPOpenOptions>


function resolveNextTick() {
    return new Promise(resolve => process.nextTick(() => resolve()))
}

export class CanceledError extends Error {    
    constructor(message) {
      super(message)
      this.canceled = true
    }
}


//async function scanPort1(host,port) { console.log('checking',host, port); return true}



function logEvent( e) {
    if (!_logger)
        _logger = new EventLogger('TCP')
    _logger.logEvent(e)
}


  
export const TCPLegacyBinding = { 
   
    setNet(NetClass) {
        _net = NetClass
    },

    /**
     * Provides a list of hosts that have port #PORT opened
     */
    async list( port, excludeList) {

        if (!port || !hasFeature('network.scan'))
            return []
        
        try {

            
            let hosts = await api.network.scan(51955, excludeList)

            if(excludeList && excludeList.length>0)
                hosts = hosts.filter( host => !excludeList.includes(host)&&!excludeList.includes(`${host}:${port}`))

            return hosts.map( host => ({
                path:`${host}:${port}`,
                manufacturer: undefined,
                locationId: undefined,
                pnpId: undefined,
                productId: undefined,
                serialNumber: undefined,
                vendorId: undefined
            }))
    
        }
        catch(err) {
            logEvent({message:'error', fn:'list()', error:err.message, stack:err.stack})
        }        
    },

    createSocket() {
        if (!_net)
            _net = window.localSupport.getNet()
        return new _net.Socket()
    },

    /**
     * Opens a connection to the serial port referenced by the path.
     */
    async open(options){
        const asyncOpen = () =>  {
            return new Promise( (resolve,reject) => {

                let host,port;

                if (!options.path)
                    return reject( new TypeError('"path" is not valid'))

                try {
                    const res = options.path.split(':')
                    if (res.length!==2)
                        return reject( new TypeError('"path" is not valid'))
                    host = res[0]
                    port = Number(res[1])
                    if (isNaN(port))
                        return reject( new TypeError('"path" is not valid'))
                }
                catch(err) {
                    return reject( new TypeError('"path" is not valid'))
                }


                const socket = TCPLegacyBinding.createSocket();
                if (options.timeout)
                    socket.setTimeout(options.timeout)

                socket.once('timeout',()=>{ reject(new Error('timeout'))})
                socket.once('error',(err)=>{ reject(err)})
                socket.once('connect',()=>{ resolve(socket)})
                //socket.once('ready',()=>{})

                socket.connect(port,host)
        
            } )
        }

        // This all can be actually ignored for the TCPBinding, but as they all a re Required, I need to setup some defaults
        const openOptions = {
            dataBits: 8,
            lock: true,
            stopBits: 1,
            parity: 'none',
            rtscts: false,
            xon: false,
            xoff: false,
            xany: false,
            hupcl: true,
            ...options
        }

        const socket = await asyncOpen()
        return new TCPPortBinding(socket,openOptions)

    }

}


export class TCPPortBinding  {

    constructor(socket, options) {
        this.logger = new EventLogger('TCPPort')
        this.socket = socket
        this.openOptions = options
        this.pendingRead = null
        this.writeOperation = null;
        this.data = null

        this.socket.on('data', this.onData.bind(this))
        this.socket.on('error', this.onError.bind(this))
        this.socket.on('close', ()=>{this.close()})
        this.socket.on('end', ()=>{this.close()})
        this.socket.on('timeout',()=>{this.onError(new Error('socket timeout'))})
    }

    get isOpen() {
        return this.socket!==null && (this.socket.readyState==='open' || this.socket.readyState==='readOnly' || this.socket.readyState==='writeOnly')
    }

    onData(data) {
        if (!this.data) this.data = Buffer.alloc(0)
        const buffer = Buffer.from(data)
        this.data = Buffer.concat([this.data,buffer])

        if (this.pendingRead) {
            process.nextTick(this.pendingRead)
            this.pendingRead = null
        }
    }

    onError(err) {
    

        if (this.pendingRead) {
            this.pendingRead(err)
            this.socket = null;
        }

    }

    
    async close() {

        if (!this.isOpen)    
            return
        
        // reset data
        this.data = Buffer.alloc(0);

        const socket = this.socket;


        socket.removeAllListeners();
        socket.destroy()
        // catch error event, so that process will not be killed in case there is such an event fired
        socket.on('error',()=>{ /*ignore*/})            
        setTimeout( ()=>{ socket.removeAllListeners()}, 500);

        if (this.pendingRead) {
            this.pendingRead(new CanceledError('port is closed'))          
        }
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
                this.read(buffer, offset, length).then(resolve, reject)
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

    write(buffer){

        if (!this.isOpen) {
            throw new Error('Port is not open')
        }

        this.writeOperation = new Promise ( async (resolve,reject)=>{
            await resolveNextTick()
            
            if (this.socket.readyState==='open' || this.socket.readyState==='writeOnly') {
                this.socket.write(buffer,()=>{
                    resolve()
                })
            }
            else {
                //this.onError( new Error('port is closed'))
                this.close()
                //resolve()
            }
            
        })

        
        return this.writeOperation;        
    }


    async update(_options) {
        await resolveNextTick()
    }

    async set(){
        
        await resolveNextTick()
    }
    
    async get() {
        if (!this.isOpen) {
          throw new Error('Port is not open')
        }
        await resolveNextTick()
        return {
          cts: true,
          dsr: false,
          dcd: false,
        }
    }    

    async getBaudRate() {
        return {baudRate:9600};
    }

    async flush() {        
        if (!this.isOpen ) {
          throw new Error('Port is not open')
        }
        await resolveNextTick()
        this.data = Buffer.alloc(0)
    }
    
      async drain() {
        if (!this.isOpen) {
          throw new Error('Port is not open')
        }
        await resolveNextTick()
        await this.writeOperation
      }

}