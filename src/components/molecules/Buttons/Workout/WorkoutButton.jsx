import React from "react"
import { Button, Center, Icon, AutoHide } from "../../../atoms"
import styled from "styled-components";
import { copyPropsExcluding } from "../../../../utils/props";


const Btn = styled(Button)`
    background: ${props => props.background||'none'} ;
    position: relative;
    float: left;
    display: flex;
    cursor: pointer;
    width: ${props => props.size} ;
    height: ${props => props.size};
    border: ${props => `1px solid ${props.borderColor || props.color || 'lightgrey'}`}; 
    border-radius: 8px;
    user-select: none;
    opacity:  ${props => props.opacity};
`;    


const Hotkey = styled(Center)`
    position: absolute;
    top: 0;
    left:0;
    height: 15px;
    width: fit-content;
    padding: 0 0.5ch 0 0.5ch;
    font-size: 10px;
    color: ${props => props.textColor ||'black' };
    border-color: black;    
    border: 3px groove;
    border-radius: 4px;
    
`



export const WorkoutButton = (props) => {

    const {width,height,size=60,hotkey,color,image,children,text,showHotkey=true } = props

    const btnProps = copyPropsExcluding(props,['image','children', 'width', 'height', 'size','text'])    
    const icnProps = copyPropsExcluding(props,['size','width', 'height'])

    icnProps.width = width??size
    icnProps.height = height??size
    icnProps.size = size  

    return <Btn {...btnProps} size={`${size+20}px`}>
        <Center position='relative'>            
            {children||image ? <Icon {...icnProps} margin={0} raw />:null}
            {text}
        </Center>
        {hotkey&&showHotkey ? 
            <AutoHide delay={3000} disableMouseOver>
                <Hotkey length={hotkey.length} textColor={color}> {hotkey}</Hotkey> 
            </AutoHide>
            : null }

    </Btn>
}