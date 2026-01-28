import React from 'react';
import styled from 'styled-components';
import { copyPropsExcluding } from '../../../utils';

const getBorder = (props) => {
    if (props.border===undefined) return 'rgb(0,0,0) 1px solid'
    if (props.border==='none') return 
    return  props.border 
}

const getBackground = (props) => {
    if (props.background===undefined) return 'black'
    if (props.background==='none') return     
    return props.background
}    

const OverlayView = styled.div`
    position:absolute;
    z-index: ${props => props.zIndex??10};
    top: ${props => props.top};
    right: ${props => props.right};
    left:  ${props => props.left};
    bottom:  ${props => props.bottom};
    padding: ${props => props.padding??'2vh'};
    margin: ${props => props.margin??0};
    height:  ${props => props.height??'40vh'};
    width: ${props => props.width??'40vw'};
    border: ${props => getBorder(props) };
    -webkit-box-shadow: ${props => (props.shadow===undefined|| props.shadow===true) ? '5px 5px 15px 5px #000000' : props.boxShadow}; 
    box-shadow: ${props => (props.shadow===undefined|| props.shadow===true) ? '5px 5px 15px 5px #000000' : props.boxShadow};
    background: ${props => getBackground(props)};
    color: ${props => props.color??'white'};
    opacity: ${props => props.opacity??0.8};
`;


export const Overlay = (props) => {

    const onClick = (e) => { 
        e.stopPropagation(); 
        if ( props.onClick && typeof(props.onClick)==='function')
            props.onClick(e)
    }

    const removeUnknownProps = (props) =>{
        const keys = Object.keys(props);
        keys.forEach( key=> {
            if ( typeof(props[key])==='function' && key!=='onClick' && !key.startsWith('onMouse') )
                delete props[key];
        })
    }

    
    const overlayProps = copyPropsExcluding(props,['className','children','ref','onClick','hideEmpty']);
    removeUnknownProps(overlayProps)

    const {className='overlay', children,hideEmpty=false} = props??{}

    const isChildEmpty = () =>{
        try {
            if ( typeof(children?.type)==='function' && !children?.type())
                return true
        }
        catch {}
        return false
    }

    if (hideEmpty && isChildEmpty()) {
        return null
    }
    
    return (
        
        <OverlayView 
            {...overlayProps} 
            onClick={onClick} 
            className={className} 
            >
            {children}
        </OverlayView>
    )    
    

}

