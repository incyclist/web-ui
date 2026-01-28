import React, { useEffect, useRef } from "react"

import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import AppTheme from "../../../../theme";
import {copyPropsExcluding} from "../../../../utils/props"
const buttonTheme  = AppTheme.get().button;

const getButtonColor = ( props) => {
    //if (props.disabled) 
    //    return buttonTheme.disabled.background;
    if (props.background)
        return props.background

    if (props.primary==='true') return buttonTheme.primary.background
    if (props.secondary==='true') return buttonTheme.secondary.background
    return buttonTheme.normal.background;
}

const getTextColor = ( props) => {
    //if (props.disabled) 
    //    return buttonTheme.disabled.background;
    if (props.textColor)
        return props.textColor

    if (props.primary==='true') return buttonTheme.primary.text
    if (props.secondary==='true') return buttonTheme.secondary.text
    return buttonTheme.normal.text;
}

const getVerticalMargin =( props) => {
    const h = getHeight(props) || getHeight(props);
    return `calc((7.7vh - ${h}) / 2)`
}

const getHeight = (props) => {
    let height = '4.4vh'
    if (props.size==='small')
        height = '3.3vh'
    return props.height!==undefined ? props.height : height
}

const getFontSize = (props) => {

    
    let fontSize = '2.2vh'
    if (props.size==='small')
        fontSize = '1.6vh'
    return props.fontSize!==undefined ? props.fontSize : fontSize
}

const Btn = styled.button`
    background: ${props => getButtonColor(props)} ;
    position: relative;
    float: left;
    display: ${props => props.hidden ? 'hidden' : 'inline-block'};
    margin-bottom: 0;
    font-weight: normal;
    text-align: center;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;    
    cursor: pointer;
    width: ${props => props.width ? props.width : undefined};
    min-width: ${props => props.width ? props.width : undefined};
    max-width: ${props => props.width ? props.width : undefined};
    background-image: ${props => props.img ? props.img : undefined};
    border: ${props => props.noBorder ? undefined: '1px solid transparent'};
    border-style: ${props => props.noBorder ? 'none': undefined};
    border-color: #2c3e50;
    border-radius: 4px;
    white-space: nowrap;
    padding: ${props => props.padding!==undefined ? props.padding : undefined};
    font-size: ${props => getFontSize(props)};
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin: ${props => props.margin!==undefined ? props.margin :  `${getVerticalMargin(props)} 1vw`};
    color: ${props => getTextColor(props)};
    height: ${props => getHeight(props)};
    opacity: ${props => props.disabled ? '0.5' : '1'};
    transition: all 0.2s;

    &:hover {
        background: ${props => (props.disabled ? getButtonColor(props) : buttonTheme.hover.background)};
        border-style: ${props => !props.no3D ? 'solid':undefined};
        border-width: ${props => !props.no3D ? '3px':undefined};
        border-color: ${props => !props.no3D ? 'white':undefined};

        box-shadow: ${props => !props.no3D ? '0px 15px 10px 0px rgba(0, 0, 0, 1)' : undefined}

    }
`

export const Button = ( props )=>{ 

    const { text,id,onClick,
        // width, height, img, noBorder, padding, margin, fontSize,primary,disabled, 
        no3D,
        className='btn', type='button',longPressDelay,
        children, logContext, propagate=false
      } = props;

    const logger = new EventLogger('Incyclist')
    const isPressedRef = useRef(false);
    const toPressedRef = useRef(null)

    const onClicked = (e)=> {     
        if (!propagate)
            e.stopPropagation()
        let button = text||id
        if (!button && typeof children==='string')
            button = children
        logger.logEvent({message:'button clicked',button,...logContext,  eventSource:'user'})
        if (toPressedRef.current) {            
            clearTimeout(toPressedRef.current)
            toPressedRef.current = null;
        }
        
        if (onClick)
            onClick(e);
    }

    const onMousePressExpired = (e)=> {
        if (isPressedRef.current) {
            toPressedRef.current = null
            if (onClick)
                onClick(e);
            toPressedRef.current = setTimeout( ()=>{onMousePressExpired(e)}, longPressDelay)
        }


    }

    const onMouseDown = (e) => {
        if (!longPressDelay)
            return
        
        isPressedRef.current = true;
        if (!toPressedRef.current) {
            toPressedRef.current = setTimeout( ()=>{onMousePressExpired(e)}, longPressDelay)
        }
    }

    const onMouseUp = (e) => {
        if (!longPressDelay)
            return
        
        isPressedRef.current = false
        if (toPressedRef.current) {
            clearTimeout(toPressedRef.current)
            toPressedRef.current = null
        }

    }

    const onMouseLeave = () => {
        onMouseUp()
    }


    useEffect( ()=>{

        
        return ()=>{
            if (toPressedRef.current) {
                clearTimeout(toPressedRef.current)
                toPressedRef.current = null
            }
            isPressedRef.current = false
    
        }   
    },[])
    
    
    const reserved = ['type','className','style','onClick','text','children','longPressDelay','primary','secondary'];
    const filtered = copyPropsExcluding( props, reserved)

    const primary = (props.primary??false).toString()
    const secondary = (props.secondary??false).toString()
    const elementProps = {...filtered,primary,secondary}

    return (
        <Btn 
            className={className}
            type={type}
            onClick={ onClicked}
            onMouseDown={ onMouseDown}
            onMouseUp={ onMouseUp}
            onMouseLeave={ onMouseLeave}
            no3D={no3D}
            {...elementProps}
            >
            {text}
            {children}
        </Btn>

    );
}

