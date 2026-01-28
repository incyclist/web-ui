import React, { useState } from 'react'
import styled from "styled-components";
import {Autosize, Column, Icon, Loader, Row, Text} from '../../../atoms'
import { TrashIcon } from '@primer/octicons-react';
import { sleep } from '../../../../utils/coding';

const getHeight = (props) => {
    return typeof(props.height)==='number' ? `${props.height}px` : props.height
}



export const Container = styled(Row)`
    z-index: 0;
    position: relative;
    background: ${props => props.theme?.pageLists?.background || 'linear-gradient(darkred,#180457)'};
    height: ${props => getHeight(props)};
    
    user-select: none;
    pading:0;
    margin-top: 0.5vh;
    color: white;
    width: calc(100% - 2.5vw);
    
    &:hover {        
        border-style: solid;
        margin: 0 0 0 0;
        border-width: 5px;
        border-color: white;
        padding: 0 0 5px 0;        
        width: calc(100% - 10px - 2.5vw);
        height: ${props => props ? `calc(${getHeight(props)} + 0.5vh - 10px)` : undefined};
    }
`

//    padding-top: 0.5vh;

export const ImageContainer = styled.div`
    position:relative;
    height: ${props => props.height};
    min-height: ${props => props.height};
    aspect-ratio: auto 235 / 132;
    user-select: none;
    pointer-events: none;
    margin: 5px;
`

export const PillContainer = styled(Row)`
    position: absolute;
    top: 0;
    right: 0;
    width: fit-content;    
    padding: 5px;

`
export const Image = styled.img`
    width: ${props => props.width};
    height: ${props => props.height};
    
    color: ${props => props.color};
    user-select: none;
    pointer-events: none;
`


export const ElevationContainer = styled.div`
    position: relative;
   
    background: none    
    height: ${props => props.height};    
    aspect-ratio: auto 235 / 132;
    opacity: 0.2;
    padding-left: 0.5vw;
    padding-right: 0.5vw;

`

export const DataContainer = styled(Column)`    
    

`

export const DetailsContainer = styled(Row)`
    width: 10vw;
    min-width: 10vw;
    position: absolute;
    top:0;
    right:0

`

export const Title = styled(Text)`
    font-size: 3vh;
    padding-left: 1vw;
`

export const ImageLabel = styled(Text)`
    font-size:1vh
`

export const SizedIcon = ({width,height,logContext,onClick})=> {
    if (width===undefined || height===undefined)
        return null;

    const size = height

    //return <TrashIcon verticalAlign="middle"  size={size} i={4}/>

    return  (
    <Icon id='delete' margin={'-2vh 0 0 0 '} padding={'5px' } size={size} width={`${size+10}px`} height={`${size+10}px`} onClick={onClick} logContext={logContext}>
        <TrashIcon verticalAlign="middle"/>
    </Icon>
)}

export const DeleteIcon = ({visible, onClick,logContext}) => {

    const [loading,setLoading] = useState(false)

    if (!visible)
        return null

    const onClickHandler = async (...args) =>{

        
        setLoading(true)
        if (typeof onClick==='function')
            await onClick(...args)
        else 
            await sleep(500)
        setLoading(false)
    }


    return (
    <Autosize width='3vw' height='3vh' >
        {loading ? <Loader/> : <SizedIcon onClick={onClickHandler} logContext={logContext}/>}
    </Autosize>    
)}