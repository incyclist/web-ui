import React, { useEffect, useState,useRef,useCallback } from "react"
import { useDevicePairing, useWorkoutList,useRouteList } from "incyclist-services"
import { useNavigate } from "react-router";
import { EventLogger } from "gd-eventlog"
import styled from "styled-components"


import { WorkoutsScreen } from "./screen"
import { getResponsiveHorizontal } from "./utils"
import { useAppUI } from "../../bindings/native-ui"
import { useWindowDimensions,usePageLogger, useUnmountEffect } from "../../hooks"
import { WorkoutDetailsDialog } from "../../components/modules/workout/selection/WorkoutDetails/wrapper"
import { DialogLauncher } from "../../components/molecules"
import { Button, CheckBox, Column, Row,Overlay } from "../../components/atoms"

const PAGE_ID = 'WorkoutsList'

const List = styled.ol`
    padding: 0;
    margin: 0.5vh 0 0 0;
`

const CheckBoxRow = styled(Row)`
    bottom: 0;
` 

export const WorkoutsPage =  () => {

    const service = useWorkoutList()
    const pairing = useDevicePairing()
    const routeSelection = useRouteList()
    const appUI = useAppUI()

    
    const [data,setData] = useState( null )
    const [showOverlay,setShowOverlay] = useState(null)
    const [markAsSeen,setMarkAsSeen] = useState(true)

    const [initialized,setInitialized] = useState(false)
    const [loading,setLoading] = useState( true )
    const [screenProps,setScreenProps] = useState(service.getScreenProps())
    const [pageState,setPageState] = useState(null)
    const listsRef = useRef()
    const ref = useRef();
    const navigate = useNavigate()
    let onStart;
    
    const updateScreenProps = useCallback((w,h)=> {

        const prev = -1;

        let respList = getResponsiveHorizontal(w,h,{offset:210,padding:0})
        const {cardSize} = respList
        delete respList.cardSize
        

        const limits = Object.keys(respList)
        const aboveIdx = limits.findIndex( limit => limit>w)

        let updated

        if (aboveIdx!==-1) {
            const newFit = respList[ limits[aboveIdx-1] ]
            updated = newFit.items
        }
        else {
            updated = -1
        }

        // list has been updated or is opened for the first time
        if (prev!==updated ) {
            const screenProps = {itemsFit:updated, responsive:respList, cardSize,offset:210, width:w, height:h}
            setScreenProps(screenProps)
            service.setScreenProps(screenProps)

            const logger = new EventLogger('WorkoutsPage')
            const cards = Math.floor((w-210)/cardSize.width)
            logger.logEvent( {message:'carousel calculated', width:w, height:h, cardSize, cards} )
        }

    },[service])

    let { height, width } = useWindowDimensions( (current,prev)=> {
        service.onResize( current,prev)         
        updateScreenProps(current.width,current.height)
        width = current.width
        height = current.height
    });
  

    const init = useCallback( () => {
        const res = service.open()

        res.observer.on( 'started', ()=>{  
            if (!loading && !data)
                setLoading(true)
        })
        .on( 'updated', (lists, listHash)=> {
            if (!lists)
                return;

            // TODO: optimize performance, when number of lists stay the same
            //       the state should not change, just lists containing changes should be re-drawn
            try {
                                
                if (!listHash || !listsRef.current || listsRef.current!==listHash) {
                    lists.forEach( l=> l.getCards().forEach(c=>{c.reset()}))
                    setData( current => ({...current,lists}))
                    listsRef.current = listHash
                }
            }
            catch(err) {
                setData( current => ({...current,lists}))
            }
            
        })
        .on( 'loading', (lists)=> { 
            setLoading(true)
        })

        .on( 'loaded', (lists)=> {
            if (loading)
                setLoading(false)
            setData( current => ({...current,lists}))
        })
        .on( 'selected', onStart)
           
        setData(res)
        setInitialized(true)
        setLoading(false)
        setPageState('open')

    },[data, loading, onStart, service])

    useEffect( ()=>{
        if (screenProps)
            return;
        updateScreenProps(width,height)
    },[screenProps, updateScreenProps,width,height])

    useEffect( ()=>{
        if (initialized || !screenProps)
            return;

        if (service.isStillLoading()) {
            setLoading(true)
            service.preload().wait().then( () => {
                init()
            })
        }
        else {
            setLoading(true)
            init()
        }

    },[init, initialized, screenProps, service])

    useUnmountEffect( ()=> {
        //console.log('# workout page unmounted')
    })

    const [logger,closePageLogger] = usePageLogger(PAGE_ID,pageState)

    const onInitialized = useCallback((list, e ) =>{
        const {item,itemsInSlide} =e
        //service.load(list,item,itemsinSlide+1)
        service.onCarouselInitialized(list,item,itemsInSlide)
        logger.logEvent( {message:'Carousel initialized', list:list.getId(),item:e?.item, itemsInSlide:e?.itemsInSlide })
        //console.log('~~~ DEBUG:Carousel initialized',new Date().toISOString(),list.getId(), e)
    },[service,logger])

    const onUpdated = useCallback((list,e ) =>{
        /* console.log('~~~ DEBUG:Carousel updated',new Date().toISOString(),e)*/
    },[])

    const onSlideChange = useCallback((list,e) =>{
    },[])

    const onSlideChanged = useCallback((list,e ) =>{
        const {item,itemsInSlide /*,isNextSlideDisabled,isPrevSlideDisabled, slide, type*/} = e;
        service.onCarouselUpdated(list,item,itemsInSlide)
    },[service])

    const closePage = useCallback(async ()=> {
        closePageLogger()
        service.close()
    },[ service,closePageLogger])


    onStart = useCallback( async (card,settings) => {

        try {

            if (settings.noRoute) {                
                routeSelection.unselect()
                logger.logEvent( {message:'Attempting to start a ride without route',readyToStart:pairing.isReadyToStart() } )


            }
            else {
                const {id,title,videoUrl} = routeSelection.getSelected()?.description??{}
                logger.logEvent( {message:'Attempting to start a ride',id,title,videoUrl,readyToStart:pairing.isReadyToStart() } )
    
            }
           
            const next =  pairing.isReadyToStart() ? '/rideOK'  : '/pairingStart'
            navigate( next, { state: { source:'/workouts' } })
            closePage()
        }
        catch(err) {
            logger.logEvent( {message:'error',fn:'onStart',error:err.message, stack:err.stack} )
        }


    },[closePage, history, logger, pairing, routeSelection])

    const onSelect = useCallback( async (card,settings) => {
        closeDialog()
        if (card)
            card.select()
    },[])

    const onCancel = useCallback( async () => {
        closeDialog()
    },[])


    const openDialog = ( Dialog,props)=> {
        ref.current.openDialog(Dialog,props)
    }
    const closeDialog = ()=> {
        ref.current.closeDialog()
    }

    const openWorkoutCreateLink = (card, enforced=false)=> {
        const {link,firstTime} = card.getDisplayProperties()

        if (firstTime && !enforced) {
            logger.logEvent( {message:'Overlay shown', overlay:'Create Workout Info', } )
            setShowOverlay(card)
            
        }
        else  if (link) {
            appUI.openBrowserWindow(link)
        }
    }

    const onOKClicked =  (card,settings) => {
        switch (card.getCardType()) {
            case 'WorkoutImport':
                service.import(settings)                               
                break;
            case 'WorkoutCreate':
                openWorkoutCreateLink(card)
                break;
            default:                
                openDialog (WorkoutDetailsDialog, {onStart,onSelect,onCancel,card})
    
        }
    }

    const onUnselectClicked =  (card) => {
        card.unselect()
    }

    const onDeleteClicked = useCallback( (card) => {
        switch (card.getCardType()) {
            case 'Workout':
            case 'ActiveWorkoutImport':
                card.delete()
                break;
            default:
                // should never happen
                break;                
    
        }

    },[])

    const onRetryClicked = useCallback( (card) => {
        switch (card.getCardType()) {
            case 'ActiveWorkoutImport':
                card.retry()
                break;
            default:
                // should never happen
                break;                
    
        }

    },[])

    const closeOverlay = ()=> {

        logger.logEvent( {message:'Overlay closed', overlay:'Create Workout Info',markAsSeen } )
        const card = showOverlay
        if (markAsSeen && card)
            card.markAsSeen()
        setShowOverlay(null)   
        openWorkoutCreateLink(card,true)     
    }

    if (!initialized) {
        return <WorkoutsScreen data={[]} loading={loading} {...screenProps}  />
    }

    return <>
    
        <WorkoutsScreen data={data?.lists} loading={loading} {...screenProps}  
            closePage={closePage}
            onOK={onOKClicked}
            onUnselect={onUnselectClicked}
            onDelete={onDeleteClicked}
            onRetry={onRetryClicked}
            onInitialized={onInitialized} onUpdated={onUpdated} onSlideChange={onSlideChange} onSlideChanged={onSlideChanged}/>

        <DialogLauncher ref={ref}/>

        {showOverlay ? <Overlay  width='40vw' height='30vh' top='35vh' left='30vw'  >
            <Column justify='center' position='relative'>
            
                <Row align='top' justify='center' height='5vh'>
                    <b>These are the steps to create a workout:</b>
                </Row>
                <Row justify='center' align='center' height='18vh' >
                    
                        <Column>
                        <List type='1'>
                            <li> Click OK to open the ZwoFactory page </li>
                            <li> Within ZwoFactory, create or select a pre-defined workout</li>
                            <li> Within ZwoFactory, download the workout using the Download button </li>
                            <li> Go back to Incyclist and import the workout using the Import Card </li>
                        </List>
                        </Column>

                        
                    
                </Row>
                <Row justify='center' height='7vh'>                    
                        <Button text='OK' onClick={closeOverlay} />
                </Row>

                <CheckBoxRow justify='left' height='3vh' position='absolute' align='bottom' bottom='0'>
                        <CheckBox label='Do not show again' value={markAsSeen} onValueChange={(checked)=> setMarkAsSeen(checked)} />
                </CheckBoxRow>
            
            </Column>
        </Overlay> : null}

    </>
        
    

}


        
        
          
