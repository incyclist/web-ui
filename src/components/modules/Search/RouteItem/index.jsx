import React, { useCallback, useEffect, useRef, useState } from 'react';


import { ElevationPreview } from '../../elevation/ElevationPreview';
import { Column,Dynamic,Loader, Pill, Row, Text, Image, UserIcon } from '../../../atoms';
import {FreeMap} from '../../../molecules/Maps';
import {Container,ImageContainer,ElevationContainer,Title, DataContainer, ImageLabel, DetailsContainer, PillContainer} from './atoms'
import { RouteItemSkeleton } from './skeleton';
import {useWindowDimensions, useUnmountEffect } from '../../../../hooks';
import {AppThemeProvider } from '../../../../theme';
import Flag from 'react-world-flags';
import { useAppState, useRouteList, useAppsService } from 'incyclist-services';
import { useHoverObserver } from '../../../../hooks/ui/useHover';
import { DeleteIcon } from '../../../molecules/Activity/ActivityListItem/atoms';
import { routeDetailsQueue } from '../../../../utils/routeDetailsLoader';

const Map = ({points}) => {

    if (!points)
        return null

    return <FreeMap  noAttribution scrollWheelZoom={false}  zoomControl={false} points={points} startPos={0} draggable={false} />
}

export const RouteItem = ( props) => {

    // true while the row is inside the fold and its content has been initialized
    const initialized = useRef(false)
    // incremented whenever the row leaves the fold, so that a details request still in flight is ignored
    const loadGeneration = useRef(0)
    // cancels the row's queued/in-flight getRouteDetails() request, if any
    const cancelLoadRef = useRef(null)
    const [loadedPoints,setLoadedPoints] = useState(undefined)
    const service = useRouteList()
    const apps = useAppsService()
    const appState = useAppState()
    const containerRef = useRef()
    const [hoverObserverRef,setHoverObserver] = useHoverObserver(containerRef)

    const newSearchUI = appState.hasFeature('NEW_SEARCH_UI')


    // removing a route is immediate, like deleting an activity or a workout - no confirmation
    const onDeleteHandler = (event) => {
        const {onDelete} = props
        event.stopPropagation();
        if (typeof (onDelete)==='function')
            onDelete()
    }

    const onContainerClicked = (e) =>{
        const {onClick } = props
        if (onClick)
            onClick(id)
    }

    const loadDetails = useCallback( (id) =>{
        const generation = loadGeneration.current
        try {
            cancelLoadRef.current = routeDetailsQueue.request(service, id, (details) => {
                // row has left the fold in the meantime
                if (generation!==loadGeneration.current)
                    return

                if (details) {
                    setLoadedPoints(details.points)
                }
            })
        }
        catch { /* ignore - row is rendered without map/elevation */ }
    },[service])


    // The fold transition is two-way: when the row leaves the fold, its map and loaded details are
    // released; when it re-enters, they are initialized again. A request still queued (not yet its
    // turn) is dequeued outright rather than merely ignored, so it never consumes a concurrency slot.
    useEffect( ()=> {
        const {outsideFold, loaded, points, shape, id} = props

        if (outsideFold) {
            if (initialized.current) {
                initialized.current = false
                loadGeneration.current++
                setLoadedPoints(undefined)
                cancelLoadRef.current?.()
                cancelLoadRef.current = null
            }
            return
        }

        if (initialized.current)
            return

        if (newSearchUI) {
            setHoverObserver(containerRef)
        }

        const hasShape = Array.isArray(shape) && shape.length>0
        if (!hasShape && (!loaded || !points) && id!==undefined) {
            loadDetails(id)
        }

        initialized.current = true
    },[loadDetails, newSearchUI, props, setHoverObserver])

    // safety net for the (today theoretical) case of a full unmount while still inside the fold
    useUnmountEffect( ()=>{
        cancelLoadRef.current?.()
        cancelLoadRef.current = null
    }, [])



    const dimensions  = useWindowDimensions()
    const height = dimensions.height*0.07; // 7vh
    const width = height *2;

    const { id, title,country,distance,totalDistance,elevation,totalElevation,previewUrl,ready, hasVideo,isLoop,isDemo,isNew,source,cntActive, shape, canDelete } = props
    // the shape store's decimated points are preferred over a full details load - see routeDetailsLoader.js
    const points = shape ?? loadedPoints ?? props.points

    const renderImage = hasVideo && ready && previewUrl!==undefined
    const renderMap   = !hasVideo

    if (props.outsideFold) {
        return <RouteItemSkeleton onClick={ onContainerClicked} />
    }


    if (!ready) {
        return <Container width={'100%'} height={'7vh'}>        
                <Loader />
        </Container> 
    }

    const formatted = (v) => {
        const {value,unit} = v
        return `${value}${unit}`
    }

    const getDistanceText = () => {

        
        try {
            if (totalDistance)
                return formatted(totalDistance)
            if (distance===undefined || distance===null || distance==='')
                return ''
            if (typeof distance ==='number')
                return distance && !isNaN(distance) ? `${(distance / 1000).toFixed(1)}km ` : '';

            if (distance.value!==undefined && distance.unit) {
                return formatted(distance)
            }

        }
        catch { /*ignore */}
        return ''
    }

    const getElevationText = ()=> {
        try {
            if (totalElevation)
                return formatted(totalElevation)
            if (elevation===undefined || elevation===null || elevation==='')
                return ''
            if (typeof distance ==='number')
                return elevation && !isNaN(elevation) ? `${(elevation).toFixed(0)}m ` : "";
            if (elevation.value!==undefined && elevation.unit) {
                return formatted(elevation)
            }


        }
        catch { /*ignore */}
        return ''
    }

    const distanceText = getDistanceText()
    const elevationText = getElevationText()
 
    //process.nextTick( ()=>{setInitialized(true)})

    const AvtiveRidesPill = ( {cntActive}) => {
        if (cntActive) {
            return <Pill  color='green' textColor='black' size='small' >
                    <UserIcon size='1vh'/> 
                    {cntActive}
                    </Pill> 
        }
        return null

    }

    return (
        <AppThemeProvider>
        <Container  height={'7vh'} onClick={ onContainerClicked} ref={containerRef}>

                <ImageContainer>
                    {renderImage ? <Image src={previewUrl}  width='100%' height='100%' style={{objectFit:'cover'}} />: null}
                    {renderMap ? <Map points={points}/> : null}
                    {!renderImage && !renderMap ? <div>&nbsp;</div> : null}

                </ImageContainer>

                <ElevationContainer>
                    <ElevationPreview line='white' width={width} height={height} color='lightblue' points={points} />
                </ElevationContainer>

                <DataContainer width='calc(100% - 13vw - 28vh)'>
                    
                    <PillContainer>
                        {isDemo ? <Pill text='Demo' color='yellow' textColor='black' size='medium' />:null}
                        {isNew&&!source ? <Pill text='New' color='orange' textColor='black' size='medium' />:null}
                        {source ? <Pill text={apps.getName(source)} color='green' textColor='white' size='medium' />:null}
                        <Dynamic observer={props.observer} event='update' prop='cntActive' transform={(v)=>v.cntActive}>
                            <AvtiveRidesPill cntActive={cntActive} />
                        </Dynamic>                                  

                    </PillContainer>
                    
                    <Row height='3.5vh' width='100%'> <Title>{title}</Title></Row>
                    <Row height='3.5vh' width='100%'> 
                        <Column width='1vw'/>
                        <Column width='4vw' justify='center' align='center'>  <Flag height={height/4} code={country}></Flag> </Column>
                        <Column width='10vw' justify='center' align='center'> <Text width='10vw' text={hasVideo ? 'Video' : 'GPX'} /> </Column>
                        <Column width='20vw' justify='center' align='center'> <Text width='20vw' text={isLoop ? 'Loop' : 'Point to Point'} /> </Column>
                    </Row>
                </DataContainer>

                <DetailsContainer>
                    {newSearchUI && canDelete?
                    <DataContainer width='3vw' justify='end'    align='center' >
                            <Dynamic observer={hoverObserverRef.current} event='hovered' prop='visible'>
                                <DeleteIcon onClick={onDeleteHandler} logContext={{id,title}} />
                            </Dynamic>
                    </DataContainer>:null}

                    <DataContainer width='5vw' justify='start' align='center'>
                            <Row><Image src='images/length.gif' color='white' width='20px' /></Row>
                            <Row><ImageLabel text='Distance' /></Row>
                            <Row><Text align='center' text={distanceText} /></Row>
                    </DataContainer>

                    <DataContainer width='5vw' justify='start' align='center'>
                            <Row><Image src='images/up.gif' color='white' width='20px' /></Row>
                            <Row><ImageLabel text='Elevation' /></Row>
                            <Row><Text align='center' text={elevationText} /></Row>
                    </DataContainer>

                </DetailsContainer>


        </Container>

        </AppThemeProvider>
    )
}