import { dateFormat } from '../../../utils/formatting';
import { EventLogger } from 'gd-eventlog';
import NativeUiService from '../../../bindings/native-ui';
import { useRef } from 'react';

const CAMERA_SOUND = 'sounds/camera-shutter.mp3';
const cameraSound = new Audio(CAMERA_SOUND);
const DEFAULT_TIMEOUT = 3000;

export  const ScreenshotTaker = ( {requested, isEnabled, isBusy, onPrepare, onDone, timeout}) => {
    const refIv = useRef(null)
    const refState = useRef('idle')
    


    const canTakeScreenshot = ()=> {
        return ( ((typeof isEnabled==='function') && isEnabled()===true) || isEnabled===true)
    }

    const isViewBusy = ()=>{
        return ( (typeof(isBusy)==='function' && isBusy()===true ) || isBusy===true )
    }

    const resolve = (res) => {

        if (refIv.current)
            clearInterval(refIv.current);
        if (onDone)
            onDone(res)

        refIv.current = null;      
        refState.current = 'idle'
    }

    const setState = (val) => {
        refState.current = val
    }

    const capture = async () => {
        const logger = new EventLogger('ScreenshotTaker')        

        if (refState.current!=='waiting')
            return

        setState( 'capturing')
        try {
            if (refIv.current)
                clearInterval(refIv.current);

            cameraSound.play();
    
            let date = dateFormat(new Date(), "%Y%m%d%H%M%S", false);
            const fileName = `screenshot-${date}.jpg`;
    
    
            logger.logEvent({ message: 'capture screen', fileName });
    
            const fullPath = await NativeUiService.getInstance().takeScreenshot({ fileName });
            const success = fullPath !== null && fullPath !== undefined;
            logger.logEvent({ message: 'Screenshot done', result: { success, fileName: fullPath } });
            if (onDone)
                onDone({ success, fileName: fullPath });
        }
        catch (err) {
            if (onDone)
                onDone({ error: err });
            logger.logEvent({ message: 'Screenshot done', result: { error: err.message } });
        }
        setState('idle')
        refIv.current = null;      
    }

    const waitForScreenshot = ()=>{
        if (refState.current==='waiting' || refIv.current)
            return;
        setState('waiting')

        const timeoutExpiresAt = Date.now() + (timeout ?? DEFAULT_TIMEOUT)
        refIv.current = setInterval( ()=> {
            if (canTakeScreenshot() && !isViewBusy() && refState.current==='waiting') {
                capture();
            }
            else if( Date.now()>timeoutExpiresAt) {
                resolve({timeout:true})
            }

        },100)
    }

    const prepareScreenshot = () => {
        if ( refState.current==='idle' ) {
            // requesting view can optionally prepare itself (e.g. hide elements) and should change isBusy=false once preparation is done
            setState('preparing')

            if (onPrepare && typeof onPrepare==='function')
                onPrepare();

            }
    }



    if (refState.current==='idle' && requested) {
        if (canTakeScreenshot() ) {
            prepareScreenshot()
            waitForScreenshot()
        }
    }

    return null;
}
