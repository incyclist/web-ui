import React, { useEffect, useRef, useState } from 'react';
import { VideoPreview } from '../../video';
import { ElevationPreview } from '../../elevation/ElevationPreview';
import { VideoArea, ElevationContainer, Container, ImageContainer, PillContainer } from '../base/atoms';
import { RouteInfo } from './RouteInfo';
import {FreeMap} from '../../../molecules/Maps';
import { Pill, Image, UserIcon, ErrorBoundary } from '../../../atoms';
import { useRouteList } from 'incyclist-services';
import { useUnmountEffect } from '../../../../hooks';
import styled from 'styled-components';

const OutsideFold = styled.div`
    opacity: 0.1;
    z-index: 0;
    display: flex;
    position: relative;
    flex-direction: column;
    height: ${props => `${props.height}px`};
    width: ${props => `${props.width}px`};
    user-select: none;

    padding: 0;
    margin: 0;

`
export const VideoSummary = ( props) => {

    const refInitialized = useRef(false)
    const [state,setState] = useState( {loading:false, points:props.points})
    const service = useRouteList()
    const cancelLoadRef = useRef(null)

    // the shape store's decimated points (props.shape) are preferred over a details load, and are
    // shared with VideoDetails (mounted at the same time, CSS-rotated out of view - see Card.jsx)
    // through the same de-duplicating, concurrency-bounded request - see RouteListService.requestRouteDetails()
    useEffect( ()=> {
        if (refInitialized.current)
            return
        refInitialized.current = true

        const hasShape = Array.isArray(props.shape) && props.shape.length>0
        if (!hasShape && !props.loaded) {
            setState( current => ({...current,loading:true}))
            cancelLoadRef.current = service.requestRouteDetails(props.id, (details) => {
                // a failed load (no details) must end the loading state too
                setState( current => ({...current, loading:false, ...(details ? {points:details.points} : {})}))
            })
        }
    },[props, service])

    useUnmountEffect( ()=>{
        refInitialized.current = false
        cancelLoadRef.current?.()
        cancelLoadRef.current = null
    },[])

    const onContainerClicked = (e) =>{
        const {onClick } = props
        if (onClick)
            onClick(id)
    }


    const { id, width='20vw',height='30vh',title,country,totalDistance, totalElevation,previewUrl,videoUrl,visible, hasVideo,isDemo,isNew,initialized,cntActive, shape } = props
    const routeProps = {title,country, totalDistance, totalElevation, width, height,visible,isDemo}
    const points = shape ?? state.points
    const hasPoints = points?.length>0

    const renderElevation =  initialized &&  visible && hasPoints  
    const renderVideo = false;
    const renderMap = initialized && visible && hasPoints && !hasVideo 
    const renderImage = previewUrl && !renderMap
 
    
    if (!visible) {
        return (
        <OutsideFold className='route-summary' width={width} height={height} onClick={ onContainerClicked}>
            
        </OutsideFold>
        )
    }
    
    
    return (
        <ErrorBoundary hideOnError>
        <Container className='route-summary' width={width} height={height} onClick={ onContainerClicked}>
            
            <ImageContainer>
                {renderImage ? <Image width='100%' height='100%' src={previewUrl}/>
                : null}

                {renderVideo ? <VideoArea><VideoPreview url={videoUrl} background='none' autoPlay={false}/></VideoArea>
                : null}

                {renderMap ? <VideoArea><FreeMap  noAttribution scrollWheelZoom={false} zoomControl={false} points={points||[]} startPos={0} draggable={false} />  </VideoArea>
                : null}

            </ImageContainer>
            <PillContainer>
                { isDemo ? <Pill text='Demo' color='yellow' size='small' /> : null} 
                { isNew ? <Pill text='New' color='orange' textColor='black' size='small' /> : null} 
                { cntActive ? <Pill  color='green' textColor='black' size='small' >
                    <UserIcon size='1vh'/> 
                    {cntActive}
                    </Pill> : null}

            </PillContainer>

            <RouteInfo {...routeProps} summary={true}/>

            {renderElevation ?
                <ElevationContainer height={`${height/4}px`}>
                    <ElevationPreview  width={width} height={height/4} line='white' color='lightblue' points={points || []} />
                </ElevationContainer> 
                :null}
            
        </Container>
        </ErrorBoundary>
    )
}