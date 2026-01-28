import {EventLogger} from 'gd-eventlog'
import {api,hasFeature} from '../../utils/electron/integration'
import EventEmitter from 'events';

export default class MessageQueue extends EventEmitter  {

    static _instance = null;
    static getInstance() {
        if ( !MessageQueue._instance ) {
            MessageQueue._instance = new MessageQueue();
        }
        return MessageQueue._instance;
    }

    constructor() {
        super();

        this.logger = new EventLogger('mq')
        if (hasFeature('mq')) {
            api.mq.on('mq-event', (event,topic,message)=>{
                if ( process.env.IPC_DEBUG ) { 
                    this.logger.log('mq-event', event,topic,message);
                }
                this.emit(event, topic,message)
            })
        }
        else {
            this.logger.log('MQ not enabled')                                   
        }
             
    }

    enabled() {
        return hasFeature('mq');
    }


    subscribe(topic) {
        return new Promise( (resolve)=>{
            if (!hasFeature('mq')) 
                return resolve(false);

            api.mq.subscribe(topic).then( resolve)
        })
    }

    unsubscribe(topic) { 
        return new Promise( (resolve)=>{
            if (!hasFeature('mq')) 
                return resolve(false);

            api.mq.unsubscribe(topic ).then(resolve)
        })

    }

    publish(topic, payload) { 

        if (!hasFeature('mq')) 
            return;

        let message;

        if (typeof payload === 'object') {
            message = JSON.stringify(payload);
        }
        else if (typeof payload === 'string') {
            message = payload;
        }
        api.mq.publish(topic, message)

    }

}
