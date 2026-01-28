import {BaseAdapter} from 'gd-eventlog'


export default class BrowserLogAdpater extends BaseAdapter {

    constructor( props={}) {
        super(props)
    }

    log(context, event={}) {
        console.log(new Date().toISOString(),{ context, ...event})
    }
}