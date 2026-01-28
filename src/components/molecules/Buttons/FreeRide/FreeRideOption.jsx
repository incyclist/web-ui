import React from 'react';
import styled from 'styled-components';
import AppTheme from '../../../../theme';
import { copyPropsExcluding } from '../../../../utils/props';
import { Button, Center } from '../../../atoms';
import { cos, sin } from '../../../../utils';

const buttonTheme  = AppTheme.get().button;


const getColor = (props) => {

    let color = 'white';
    if (!props)
        return color
    
    if (props.pathInfo===undefined) {
        color = props.background || color;
    }
    else if ( props.pathInfo.selected)  {
        color = buttonTheme.primary.background
    }
    return color;
}

const getSize = (props, factor=1) => {
    const sizeValue = props.size===undefined ? 5 : props.size;
    const size = `${sizeValue*factor}vh`
    return size

}

const Btn = styled(Button)`
    background-color: ${props => getColor(props)};
    border-color: #2c3e50;
    position: relative;
    float: left;
    display: inline-block;
    margin-bottom: 0;
    font-weight: normal;
    text-align: center;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    background-image: none;
    border: 1px solid transparent;
    white-space: nowrap;
    padding: 1.1vh 1vw;
    font-size: 2.2vh;
    border-radius: 4px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin: 1.35vh 1vw;
    color: ${props => props.textColor ||'black' };
    overflow:hidden;
    width: ${props => getSize(props)};
    height: ${props => getSize(props)};

    hover: {
        color: #ffffff;
    }
`;    

const Img = styled.img`
    max-width:80%;
    max-height:80%;
`;

const Hotkey = styled(Center)`
    position: absolute;
    top: 0;
    left:0;
    width: ${props => getSize(props,0.33)};
    height: ${props => getSize(props,0.33)};
    font-size: ${props => getSize(props,0.25)};
    color: ${props => props.textColor ||'black' };
    border-color: black;    
    border: 3px groove;
    border-radius: 4px;
    
`

export const FreeRideOptionButton = (props) => {


    const onClick = (event) => {
        //console.log(event, event.target, event.target===undefined? event.target.options: '')
        if ( props?.onClick!==undefined) {
            props.onClick(event);
        }   
    }

    const getChilds = () => {

        const {pathInfo,hotkey,image,text,children} = props;
        
        if ( pathInfo===undefined )  {
            
            return (
                <div style={{margin:'auto'}} >
                    {text??null}                    
                    {image ? <Img src= {image} alt=''>
                        {children}
                    </Img>  : null}                    
                    {hotkey ? <Hotkey> {hotkey}</Hotkey> : null }
                </div>
            )
            
        }

        const alpha = pathInfo.direction
        const x = 50+50*sin(alpha)
        const y = 50-50*cos(alpha)
        const points2 = "50,50 "+x+","+y;
        const color = props.color || pathInfo.color

        return (
            <div style={{margin:'auto'}}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" >
                    <polyline points="50,100 50,50" fill="none" stroke="grey" style={{strokeWidth:5}}/>
                    <polyline points={points2} fill="none" stroke={color} style={{strokeWidth:10}}/>
                </svg>
                {hotkey ? <Hotkey> {hotkey}</Hotkey> : null }
            </div>

        )
    }

    
    const htmlProps = copyPropsExcluding(props,['className','onClick','style','text','image']);
    const className = props.className || 'route-opt-button' 
    
    return (
        <Btn className={className} onClick = {onClick} style={props.style} {...htmlProps} id= {props.id || 'Free-Ride Option '+props.hotkey}> 
            {getChilds()}                
        </Btn>
    )
    
}

