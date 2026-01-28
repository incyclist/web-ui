import React from "react"
import styled from "styled-components"
import { Button } from "../Button"
import { Svg } from "../../Images/Svg"
import { Text } from "../../Text"
import { AppThemeProvider } from "../../../../theme"

const View = styled(Button)`
    background: ${props => props.background || 'none'};
    border:none;
    width:${props => props.width};
    min-height:${props=> props.height};
    height:${props=> props.height};
    display:flex;
    justify-content: center;    
    margin: ${props=>props.margin};
    padding: ${props=>props.padding};
    &:hover {
        background: ${props => props.backgroundHover||props.theme?.button?.hover?.background};
    }


    
}    
`

const Label = styled(Text)`
    position:absolute;
    font-size: 15px;
    bottom:0;
    text-align: center;
    width:100%
    margin:0;
    padding:0;
`


export const Icon = ( {image,size,imageFormat='svg',color,margin,padding, label, id,backgroundHover, width,height, background,children,onClick, raw,logContext})=>{

    const src = `${image}`
    const widthStr = width ? (typeof width ==='number' ? `${width}px`: width) : undefined
    const heightStr = typeof height ==='number' ? `${height}px`: height
    const imageSize = size ?? (!label ? 
        heightStr : 
        typeof height ==='number' ? `${height-20}px`: `calc (${heightStr}-20px)`)

    const renderChildren =()=> {
        const childProps = {size:imageSize,background,color,fill:color,onClick}

        if ( Array.isArray(children)) {
            return children.map ( (child,idx) => {
                if (!child)
                    return null
                if (typeof child==='string') {
                    if (child.trim().length===0)
                        return null;
                    return child;
                }
                const Child = child.type;
               
                return <Child key={idx}  {...child.props}  {...childProps}/>;
            })    
        }
        else {
            if (!children)
                return null;
            if (typeof children==='string') {
                if (children.trim().length===0)
                    return null;
                return children;
            }

            const Child = children.type;
          
            return <Child {...children.props} {...childProps}/>;
        }
    }

    if (raw) {
        return (
        <AppThemeProvider>
            {children? 
                renderChildren() : 
                <Svg src={src} fill={color} width={imageSize} height={imageSize} /> 
            }
            {label?<Label color={color} justify='center'>{label}</Label>:null}
        </AppThemeProvider>
        )
    }

    return (        

        <AppThemeProvider>
            <View onClick={onClick} id={id??label} no3D={true} backgroundHover={backgroundHover} width={widthStr} height={heightStr} background={background} margin={margin} padding={padding} logContext={logContext}>
                {children? 
                    renderChildren() : 
                    <Svg src={src} fill={color} width={imageSize} height={imageSize} /> 
                }
                {label?<Label color={color} justify='center'>{label}</Label>:null}
            </View>
        </AppThemeProvider>
    )
    
} 