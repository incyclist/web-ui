import {BaseAdapter} from 'gd-eventlog'
import { useReactNative } from '../../hooks/integration/ReactNative';


export default class ReactNativeLogAdpater extends BaseAdapter {

    constructor( props={}) {
        super(props)
    }

    log(context, event) {
        useReactNative().log(context,event)
    }
}