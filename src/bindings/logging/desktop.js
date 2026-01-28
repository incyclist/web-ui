import {EventLogger,BaseAdapter,ConsoleAdapter} from 'gd-eventlog'
import { api, hasFeature } from '../../utils/electron/integration'

export default class ElectronLogAdpater extends BaseAdapter {

    constructor( props={}) {
        super(props)
        const {mode} = props;

        this.logs = [];
        this.iv = setInterval( this.send.bind(this), 2000)
        
        if ( mode && mode==='development') {
            EventLogger.registerAdapter( new ConsoleAdapter({depth:1}))
        }

        this.logApi =  hasFeature('logging') ? api.logging : { bulkLog: ()=>{}}
    }

    stop() {
        if (this.iv) {
            clearInterval(this.iv)
            this.iv = null;
        }
    }

    send() {
        const data = this.logs
        if (!data?.length)
            return;
        this.logs  = []
        this.logApi.bulkLog(data)

    }

    log(context, event) {

        
        this.logs.push( {context,event})

        if ( this.logs.length>100) {
            this.send();
        }

        

    }
}