import React, { useCallback, useEffect, useRef, useState } from 'react';


import { ElevationPreview } from '../../elevation/ElevationPreview';
import { Column,Dynamic,Loader, Pill, Row, Text, Image, UserIcon } from '../../../atoms';
import {FreeMap} from '../../../molecules/Maps';
import {Container,ImageContainer,ElevationContainer,Title, DataContainer, ImageLabel, DetailsContainer, PillContainer} from './atoms'
import {useWindowDimensions } from '../../../../hooks';
import {AppThemeProvider } from '../../../../theme';
import Flag from 'react-world-flags';
import styled from 'styled-components';
import { Observer, useAppState, useRouteList, waitNextTick,useAppsService } from 'incyclist-services';
import { useHoverObserver } from '../../../../hooks/ui/useHover';
import { DeleteIcon } from '../../../molecules/Activity/ActivityListItem/atoms';

const Map = ({points}) => {

    if (!points)
        return null

    return <FreeMap  noAttribution scrollWheelZoom={false}  zoomControl={false} points={points} startPos={0} draggable={false} /> 
}
const OutsideFold = styled(Container)`
    opacity: 0.1;
`

export const RouteItem = ( props) => {

    const initialized = useRef(false)
    const [observer,setObserver] = useState(null)
    const service = useRouteList()
    const apps = useAppsService()
    const appState = useAppState()
    const containerRef = useRef()
    const [hoverObserverRef,setHoverObserver] = useHoverObserver(containerRef)

    const newSearchUI = appState.hasFeature('NEW_SEARCH_UI')


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

    const getDetails = useCallback( (id) =>{
        try {
            const pointsObserver = new Observer();

            service.getRouteDetails(id).then( details=> {

                if (details) {
                    pointsObserver.emit( 'loaded', details.points)
                    waitNextTick().then ( pointsObserver.stop())
                }
            })
            return pointsObserver
            
        }
        catch(err) {
            return null;
        }
    },[service])


    useEffect( ()=> {
        const {outsideFold, loaded, points, id} = props
        if (initialized.current)
            return

        if (!outsideFold && newSearchUI) {
            setHoverObserver(containerRef)
        }

        if ( (!loaded || !points) && !outsideFold) {
            if (id!==undefined) {
                setObserver( getDetails(id))
            }
        }

        
        initialized.current = !props.outsideFold
    },[getDetails, newSearchUI, props, setHoverObserver])
    

    
    const dimensions  = useWindowDimensions()
    const height = dimensions.height*0.07; // 7vh
    const width = height *2;

    const { id, title,country,distance,totalDistance,elevation,totalElevation,points,previewUrl,ready, hasVideo,isLoop,isDemo,isNew,source,cntActive } = props

    const renderImage = hasVideo && ready && previewUrl!==undefined 
    const renderMap   = initialized && !hasVideo 

    if (props.outsideFold) {
        return (
            <AppThemeProvider>
                <OutsideFold opacity='0.1'  height={'7vh'} onClick={ onContainerClicked}></OutsideFold>        
            </AppThemeProvider>
        )
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
                    {renderImage ? <Image src={previewUrl}  height='7vh'  />: null}
                    {renderMap ? 
                        <Dynamic observer={observer} events={'loaded'} prop='points'>                        
                            <Map points={points}/> 
                        </Dynamic>

                        : null}
                    {!renderImage && !renderMap ? <div>&nbsp;</div> : null}
                    
                </ImageContainer>

                <ElevationContainer>
                    <Dynamic observer={observer} events={'loaded'} prop='points'>                        
                        <ElevationPreview line='white' width={width} height={height} color='lightblue' points={points} />
                    </Dynamic>
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
                    {newSearchUI?
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