import React, { useEffect, useRef } from "react"

import styled, { css } from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import AppTheme from "../../../../theme";
import {copyPropsExcluding} from "../../../../utils/props"
const buttonTheme  = AppTheme.get().button;

const getButtonColor = ( props) => {
    const theme = props.theme?.button ?? buttonTheme
    //if (props.disabled) 
    //    return buttonTheme.disabled.background;
    if (props.background)
        return props.background

    if (props.primary==='true') return theme.primary.background
    if (props.secondary==='true') return theme.secondary.background
    return theme.normal.background;
}

const getTextColor = ( props) => {
    const theme = props.theme?.button ?? buttonTheme
    //if (props.disabled) 
    //    return buttonTheme.disabled.background;
    if (props.textColor)
        return props.textColor

    if (props.$responsive && props.primary==='true')
        return props.theme?.colors?.text ?? AppTheme.get().colors?.text ?? theme.primary.text

    if (props.primary==='true') return theme.primary.text
    if (props.secondary==='true') return theme.secondary.text
    return theme.normal.text;
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

// Outline variant (same look as the mobile header actions): orange border and text on a light dark
// tint (the tint keeps it legible on the blurred photo backgrounds). Hover turns green with white
// text and, deliberately, never grows the border, so the button's size stays stable.
const outlineStyle = css`
    background: rgba(0,0,0,0.25);
    color: #dd9933;
    border: 1px solid #dd9933;
    font-weight: 500;
    padding: ${props => props.padding!==undefined ? props.padding : '0 0.75em'};

    &:hover {
        background: ${props => props.disabled ? 'rgba(0,0,0,0.25)' : '#8dc100'};
        border: 1px solid ${props => props.disabled ? '#dd9933' : '#8dc100'};
        color: ${props => props.disabled ? '#dd9933' : 'white'};
        box-shadow: none;
    }

    &:focus-visible {
        outline: 2px solid white;
        outline-offset: 2px;
    }
`

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
        background: ${props => (props.disabled ? getButtonColor(props) : props.theme?.button?.hover?.background ?? buttonTheme.hover.background)};
        border-style: ${props => !props.no3D ? 'solid':undefined};
        border-width: ${props => !props.no3D ? '3px':undefined};
        border-color: ${props => !props.no3D ? 'white':undefined};

        box-shadow: ${props => !props.no3D ? '0px 15px 10px 0px rgba(0, 0, 0, 1)' : undefined}

    }

    ${props => props.outline ? outlineStyle : ''}
    ${props => props.$responsive && css`
        display: inline-flex;
        float: none;
        align-items: center;
        justify-content: center;
        gap: 10px;
        box-sizing: border-box;
        height: ${props.size === 'small' ? '32px' : '38px'};
        min-height: ${props.size === 'small' ? '32px' : '38px'};
        margin: 0;
        padding: 0 12px;
        border-radius: ${props.$shape === 'pill' ? '999px' : props.$shape === 'rounded' ? '8px' : '4px'};
        font-size: ${props.size === 'small' ? '12px' : '13px'};
        font-weight: 650;
        line-height: 1;
        &:hover { border-width: 1px; border-color: transparent; box-shadow: none; }
        &:focus-visible { outline: 3px solid ${props.theme?.button?.hover?.background ?? buttonTheme.hover.background}; outline-offset: 2px; }
    `}
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
    
    
    const reserved = ['type','className','style','onClick','text','children','longPressDelay','primary','secondary','responsive','shape'];
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
            $responsive={props.responsive}
            $shape={props.shape}
            {...elementProps}
            >
            {text}
            {children}
        </Btn>

    );
}
