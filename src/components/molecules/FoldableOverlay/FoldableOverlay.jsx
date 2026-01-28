import React, { useEffect, useRef, useState } from 'react';
import {FoldUpIcon,XIcon } from '@primer/octicons-react'
import styled from 'styled-components';

import { copyPropsExcluding } from '../../../utils';
import {ErrorBoundary, Overlay}  from '../../atoms'
import { EventLogger } from 'gd-eventlog';
import { useUserSettings } from 'incyclist-services';

const View = styled(Overlay)`
    display: ${props => props.hidden ? 'none': undefined }
`

const getTop = (props) => {    
    return props.fold?.startsWith('top') ? '5px': undefined
}

const getBottom = (props) => {
    return props.fold?.startsWith('bottom') ? '5px': undefined    
}

const ButtonArea = styled.div`
    position:absolute;
    z-index: ${props => props.zIndex!==undefined?  props.zIndex+10 : 11};
    background: none;
    top: 1px;
    right: 1px;
    margin: 0;
    color: white;
    display: flex;
    text-align: right;
    display: ${props => (props.visible!==undefined && !props.visible)? 'none' :'flex'};
`;


const Btn = styled.div`
`


const HideIcon = styled(XIcon)`
    background: black;
    border-radius: 50%;
    position: absolute;
    width: 3vh;
    height: 3vh;
    right: ${props => props.fold==='bottom-right' || props.fold==='top-right' ? '5px': undefined};
    left: ${props => props.fold==='bottom-left' || props.fold==='top-left' ? '5px': undefined};
    top: ${props => getTop(props)};
    bottom: ${props => getBottom(props)};

`

const ShowIcon = styled(FoldUpIcon)`
    background: black;
    border-radius: 50%;
    position: absolute;
    width: 3vh;
    height: 3vh;
    right: ${props => props.fold==='bottom-right' || props.fold==='top-right' ? '5px': undefined};
    left: ${props => props.fold==='bottom-left' || props.fold==='top-left' ? '5px': undefined};
    top: ${props => getTop(props)};
    bottom: ${props => getBottom(props)};
`


export const FoldableOverlay = (props)=> {

    const userSettings = useUserSettings()

    const {foldId,persistState,stateKey} = props

    const [mounted, setMounted] = useState(false);
    const [minimized, setMinimized] = useState(props.minimized);
    const refMinimized = useRef(props.minimized);

    useEffect( ()=>{
        if (mounted)
            return

        const getSettings = (key,defValue) => {
            try {
                return userSettings.get(key,defValue)
            }
            catch {
                return defValue
            }
        }
   

        if (persistState) {
            const enabled = getSettings(`preferences.${stateKey}.${foldId}`,true)
            const shown = !(props.minimized??false)
            if (enabled!==shown)
                setMinimized(!enabled)
                
        }

        
        setMounted(true)
    },[foldId, mounted, persistState, props.minimized, stateKey, userSettings])


    //has minimized prop changed?
    useEffect( ()=>{
        if (props.minimized!==undefined && props.minimized!==refMinimized.current) {
            refMinimized.current = props.minimized
            setMinimized(props.minimized)
        }
    },[minimized,props.minimized, refMinimized])

    const onHide = () => {
        setMinimized(true)
        if (persistState) 
            userSettings.set(`preferences.${stateKey}.${foldId}`,false)

    }   

    const onShow = () => {
        setMinimized(false)
        if (persistState) 
            userSettings.set(`preferences.${stateKey}.${foldId}`,true)

    }   


    if (!mounted || props.visible===false)
        return null

    return <FoldableOverlayView {...props} minimized={minimized} onHide={onHide} onShow={onShow} />

}

export const  FoldableOverlayView = (props)  =>  {

    const {fold='top-right', foldId, onHide, onShow,children,visible=true,minimized=false, useMinimizeProp=false} = props??{}
    const logger = new EventLogger('FoldableOverlay')

    const [hovered,setHovered] = useState(false)



    const minimize = (e) => {
        e.stopPropagation()
        logger.logEvent( { message:'button clicked',button:'minimize overlay',overlay:foldId, fold,EventSource:'user'}  )

        if (typeof onHide==='function') {
            onHide()
        }
    }

    const maximize = (e) => {
        e.stopPropagation()

        logger.logEvent( { message:'button clicked',button:'maximize overlay',overlay:foldId, fold,EventSource:'user'}  )
        if (typeof onShow==='function') {
            onShow()
        }
    }

    const onMouseEnter = () => {
        if ( hovered)
            return;
        setHovered(true)
    }

    const onMouseLeave = () =>{
        if ( !hovered)
            return;
        setHovered(false)
    }

    const childrenWithProps = React.Children.map(children, child => {
        // Checking isValidElement is the safe way and avoids a
        // typescript error too.
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { minimized });
        }
        return child;
      });



    const removeUnknownProps = (props) => {
        const keys = Object.keys(props);
        keys.forEach( key=> {
            if ( typeof(props[key])==='function' && key!=='onClick' )
                delete props[key];
        })
    }
 
    try {
        if(!visible) {
            return null
        }
        
        const overlayProps = copyPropsExcluding(props,['className','children','onClick','fold']);
        if (minimized) {
            overlayProps.background = 'none';
            overlayProps.shadow = false;
            overlayProps.border = 'none';
        }
        removeUnknownProps(overlayProps)

        const renderChildren = !minimized || useMinimizeProp
        
        return (
            <ErrorBoundary hideOnError>
                <View  {...overlayProps} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} >
                    <ButtonArea zIndex={1000} opacity={1}  visible={hovered} >
                        {minimized ? <Btn onClick={maximize}><ShowIcon fold={fold}/></Btn> :
                        <Btn onClick={minimize}><HideIcon fold={fold}/></Btn>}   
                    </ButtonArea>
                    {renderChildren ? childrenWithProps :  null}
                </View>
            </ErrorBoundary>
        )    
    }
    catch(err) {
        logger.logEvent( { message:'error in componenet',component:'FoldableOverlay',foldId, fold,error:err.message, stack:err.stack}  )
        return null
    }        
 
    
    
}