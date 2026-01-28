import React, { useEffect, useRef, useState }  from 'react';
import {FreeMap} from '../../../molecules/Maps';
import { Container, ImageContainer,MapArea, ButtonContainer,LoaderContainer  } from '../base/atoms';
import { RouteInfo } from './RouteInfo';
import { Button, Icon, Loader  } from '../../../atoms';
import { TrashIcon } from '@primer/octicons-react';
import { copyPropsExcluding } from '../../../../utils/props';
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

const Trash = (props)=> {
    const childProps = copyPropsExcluding(props,['size','width','height'])
    return <TrashIcon {...childProps} size={20} />
} 

export const VideoDetails = ( props) => {
  
    const refInitialized = useRef(false)
    const refInitializing = useRef(false)
    const [state,setState] = useState( {loading:false, points:props.points})
    const service = useRouteList()

    
    useEffect( ()=> {
        if (refInitialized.current)
            return

        refInitializing.current = true
        if (!props.loaded) {
            setState( current => ({...current,loading:true}))
            service.getRouteDetails(props.id).then(details => {
                // ignore response if component was already unmounted
                if (!refInitialized.current && !refInitializing.current)
                    return

                if (details) {
                    setState( current => ({...current,loading:false, points:details.points}))
                }
            })


        }


        refInitialized.current = true;
        refInitializing.current = false
    },[props, service])

    useUnmountEffect( ()=>{
        refInitialized.current = false        
    },[])

    const { visible,title,country,totalDistance,totalElevation,
            width='20vw',height='30vh',onOK,onDelete, canDelete=true } = props


    const routeProps = {title,country, totalDistance, totalElevation,width, height}
    const {loading,points} = state

    if (!visible ){
        return <OutsideFold width={width} height={height}>
        </OutsideFold> 
    }

    return (
        <Container width={width} height={height} >
            <ImageContainer>
                { points?
                <MapArea> <FreeMap  noAttribution scrollWheelZoom={false} zoomControl={false} points={points||[]} startPos={0} draggable={false} />  </MapArea>            
                :null}
                {loading ? <LoaderContainer><Loader/></LoaderContainer>: null}

            </ImageContainer>

            <RouteInfo {...routeProps}/>

            <ButtonContainer>
                <Button text='OK' disabled={loading} logContext={ {title}} onClick={onOK} />
                {canDelete?<Icon id='delete' height={20} margin={0} padding={0} onClick={onDelete}><Trash/></Icon>:null}
            </ButtonContainer>

        </Container>    
    )
}

