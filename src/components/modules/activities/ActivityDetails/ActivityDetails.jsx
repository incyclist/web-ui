import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Button, ButtonBar,  Column, Divider, ErrorBoundary, Loader, Row, Text } from '../../../atoms'
import { Dialog, FreeMap } from '../../../molecules'
import { formatDateTime, useActivityList} from 'incyclist-services'
import { ActivityGraph,FilePill,UploadPill} from '../../../molecules/Activity'
import { EventLogger } from 'gd-eventlog'
import { useAppUI } from '../../../../bindings/native-ui'


const ContentArea = styled(Column)`
    height: calc(100% - 7.7vh);
    width: calc(100% - 0.8vw);
    padding-left:0.4vw;
    padding-right:0.4vw;
    font-size: 1.7vh;
`

const GraphRow = styled(Row)`
    background: ${props => props.theme?.dialogContent?.background || 'white'};
    color: ${props => props.theme?.dialogContent?.text || 'black'};
    position: relative;
`

export const ActivityDetails = ({activity, units, title,started,duration, distance, elevation,logs, points, 
                                showMap,startPos,segment,loading,
                                canStart, canOpen,exports, uploads,                                
                                onCancel, onStart, onOpen, onOpenUpload, onOpenExport,onDelete, onExport, onUpload}) => { 

    const [dialogState,setDialogState] = useState(null)
    const logger = useRef(new EventLogger('ActivityDetails')).current

    useEffect(() => {
        if (dialogState===null)
            setDialogState('open')
        
    }, [dialogState]);

    const close = async () =>{
        setDialogState('closed')
        await new Promise(done => process.nextTick(()=>{done()}))
    }

    const onCancelClicked = async () => {
        await close();

        if (typeof onCancel === 'function') {
            onCancel()
        }
    }

    const onStartClicked = async () => {
        await close();

        if (typeof onStart === 'function') {
            onStart()
        }
    }

    const onDeleteClicked = async () => {
        await close();

        if (typeof onDelete === 'function') {
            onDelete()
        }
    }

    const onOpenClicked = async () => {
        await close();

        if (typeof onOpen === 'function') {
            onOpen()
        }
    }

    const getDateTime =(start) => {
        let str = ''
        try {
            if (start) {
                str = formatDateTime(start,'%d.%m.%Y %H:%M')            
            }
        }
        catch(err) {
            logger.logEvent({message:'error',fn:'getDateTime',error:err.message,stack:err.stack,start})
        }
        return str
        
    }

    const getDuration =(rideTime) => {
        let duration = ''

        try {
            if (rideTime) {
                const hours = Math.floor(rideTime / 3600)
                const minutes = Math.floor((rideTime % 3600) / 60)
                if (hours > 0)
                    duration = `${hours}h ${minutes}min`
                else
                    duration = `${minutes}min`
            }

        }
        catch(err) {
            logger.logEvent({message:'error',fn:'getDuration',error:err.message,stack:err.stack,rideTime})
        }
        return duration
        
    }

    const formatted = (v,digits)=> {

        const {value,unit} = v

        if (digits===undefined)
            return `${value} ${unit}`
        return `${value.toFixed(digits)} ${unit}`
    }

    const getElevation = () => {
        let str = ''

        try {
            if (elevation===undefined || elevation===null)
                return ''

            if (typeof elevation==='number') {
                return `${elevation.toFixed(0)} m`
            }

            if (elevation.value!==undefined && elevation.unit) 
                return formatted(elevation)


        }
        catch(err) {
            logger.logEvent({message:'error',fn:'getElevation',error:err.message,stack:err.stack,elevation})
        }
        return str
    }

    const getFiles = ()=>{
        
        const files = (exports??[]).map(e => ({
            text:e?.type,
            size:'large',            
            color: e?.file ? 'green' : 'lightgrey',
            textColor: e?.file ? 'white' : 'black'                            ,
            canOpen: e?.file!==undefined && e?.file!==null,
            canCreate: e?.file===undefined,
            loading:e?.creating
        }))
        return files
    }
    const getUploads = ()=>{

        try {
            // Some code here
            const files = (uploads??[]).map(e => {
                const failed = e?.status === 'failed'
                const success = e?.status === 'success'
                const canOpen = success;
                const canSynchronize = !success
                const loading = e?.synchronizing

                let color, textColor = 'white'
                if (failed)
                    color = 'red'
                else if (success)
                    color = 'green'
                else {
                    color = 'lightgrey'
                    textColor = 'black'
                }
                
                return{
                        size:'large',                
                        color, textColor,
                        text:e?.text??e?.type,
                        canOpen,canSynchronize,
                        type:e?.type,
                        loading
                    
            }})
            return files
        }
        catch (error) {
            logger.logEvent({message:'error',fn:'getUploads',error:error.message,stack:error.stack,uploads})
            return []
        }

    }

    const getDistance = (distance)=>{
        try {
            if (distance===undefined && distance!==null)
                return ''
            if (typeof distance==='number')
                return `${(distance/1000).toFixed(1)} km`
            if (distance.value!==undefined && distance.unit) 
                return formatted(distance,1)


        }
        catch (error) {
            logger.logEvent({message:'error',fn:'getDistance',error:error.message,stack:error.stack,meters: distance})
            return ''
        }
    }

    if (loading){
        return (
            <ErrorBoundary>
                <Dialog width='90vw' height='90vh' id='ActivityDetails' log={{title:title}} title={title??'Activity'} /*onOutsideClicked={onUserCancel}*/ zIndex={100} onESC={onCancelClicked}>
                    <ContentArea>
                        <Loader />
                    </ContentArea>
                    <ButtonBar justify='center'>
                        <Button text='Close' onClick={onCancelClicked} />

                    </ButtonBar>
                </Dialog>
            </ErrorBoundary>

        )
    }

    return ( 
        
            <Dialog width='90vw' height='90vh' id='ActivityDetails' log={{title:title}} title={title} /*onOutsideClicked={onUserCancel}*/ zIndex={100} onESC={onCancelClicked}>
            <ContentArea>
                <Row height='33%'>
                    <Column width='50%' margin='0 1vw 0 1vw'>
                        {showMap ? <FreeMap  zoomControl={true} points={points} startPos={0} draggable={false}/> : null}

                    </Column>
                    <Column width='50%'>
                        <Text label='Started' labelWidth='10ch' text={getDateTime(started)} />
                        <Text label='Duration' labelWidth='10ch' text={getDuration(duration)} />
                        {startPos ? <Text label='Start At' labelWidth='10ch' text={getDistance(startPos)} />:null}
                        {segment ? <Text label='Segment' labelWidth='10ch' text={segment} />:null}
                        <Text label='Distance' labelWidth='10ch' text={getDistance(distance)} />
                        <Text label='Elevation' labelWidth='10ch' text={getElevation()} />
                        <Row >
                            <Column width='10ch'>
                                <Text text={'Files'} labelWidth='10ch' />
                            </Column>
                            <Column >
                                <Row>
                                {getFiles().map((e,i) => <FilePill margin='0.2vh 0.2vh' key={e.text} {...e} 
                                    onOpen={()=>onOpenExport(exports[i])}
                                    onCreate={()=>onExport(exports[i])}
                                />)}
                                </Row>
                            </Column>
                        </Row>
                        <Row>
                            
                            <Column width='10ch'>
                                <Text text={'Uploads'} labelWidth='10ch' />
                            </Column>
                            <Column >
                                <Row>
                                {getUploads().map((e,i) => <UploadPill key={e.text} {...e} 
                                    onOpen={()=>onOpenUpload(uploads[i])}
                                    onSynchronize={()=>onUpload(uploads[i])}
                                    />

                                    )}
                                </Row>
                            </Column>
                            
                        </Row>
                        
                    
                    </Column>

                </Row>
                <Divider width='90%' />
                <GraphRow height='67%'>
                    <Column width='100%' height='100%' className='ActivityGraphRow' position='relative'>
                        <ActivityGraph activity={activity} units={units} dialog={this}/>
                    </Column>
                </GraphRow>

            </ContentArea>
            <ButtonBar justify='center'>
                <Button text='Ride Again' onClick={onStartClicked} disabled={!canStart} />
                <Button text='Open' onClick={onOpenClicked} disabled={!canOpen} /> 
                <Button text='Close' onClick={onCancelClicked} />
                <Button text='Delete' onClick={onDeleteClicked} margin='0 0 0 4vw' />

            </ButtonBar>
            </Dialog>
        
    )

}

export const ActivityDetailsDialog = ({onOpen,onStart})=> {

    const service = useActivityList()
    const ui = useAppUI()

    const [state,setState] = useState(null)
    const [loading,setLoading] = useState(false)
    const mountedRef = useRef() 
    const observerRef = useRef()

    const logger = new EventLogger('ActivityDetails')

    const logError = useCallback ( (err,fn,details={}) => { 
        logger.logEvent ({message:'error',fn,error:err.message,stack:err.stack,...details})
    },[logger])


    const init = useCallback( () => {
        try {
            setState( service.openSelected() )
            observerRef.current = service.getObserver()
            observerRef.current.on('updated', (update) => {
                setState(update)
            })
        }
        catch(err) {
            logError(err,'init')
        }
    },[logError, service])

    useEffect(() => {
        if (mountedRef.current)
            return;

        mountedRef.current = true
        try {
            const activity = service.getSelected()
            if (!activity)  
                return

            const loaded = activity.isComplete()
            if (!loaded) {
                setLoading(true)
                activity.load().then( () => {
                    init()
                    setLoading(false)
                })
                return
            }
            init()
        }
        catch(err) {
            logError(err,'useEffect')
        }
    },[init, logError, service])

    const onCancel = () => {
        try {
            service.closeSelected()
            setState(null)
        }
        catch(err) {
            logError(err,'onCancel')
        }
    }

    const onDelete = async ()=>{

        try {
            const activity = service.getSelected()
            service.closeSelected()

            await service.delete(activity.id)
            setState(null)
        }
        catch(err) {
            logError(err,'onDelete')
        }
    }

    const onStartHandler = async () => { 
        try {
            const {canStart,route} = await service.rideAgain()
            if (canStart  ) {
                setState(null)
                if (typeof onStart === 'function')
                    onStart(route)
            }
        }
        catch(err) {
            logError(err,'onStart')
        }

    }


    const onOpenUpload = (upload) => {
        try {
            ui.openBrowserWindow(upload.url)
        }
        catch(err) {
            logError(err,'onOpenUpload')
        }
    }

    const onOpenFile= (fileDef)=> {
        try {
            ui.showItemInFolder(fileDef.file)
        }
        catch(err) {
            logError(err,'onOpenUpload')
        }
    }

    const onExport = async (fileDef) => {
        service.export(fileDef.type)
    }

    const onUpload = async (upload) => {
        service.upload(upload.type)
    }

    if (loading) {
        const activity = service.getSelected()
        return <ActivityDetails loading title={activity.title} activity={activity}/>
    }

    if (state) 
        return <ActivityDetails {...state} 
            onCancel={onCancel} onStart={onStartHandler} onDelete={onDelete} onOpen={onOpen} 
            onExport={onExport} onOpenExport={onOpenFile}
            onUpload={onUpload} onOpenUpload={onOpenUpload} />
    
    return null;
}