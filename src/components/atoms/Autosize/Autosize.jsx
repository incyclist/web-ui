import React, { createRef } from "react";
import { Row } from "../layout";
import styled from "styled-components";
import { copyPropsExcluding } from "../../../utils/props";


const Container = styled(Row)`
  XminWidth:${props => props.width || '100%'};
  XminHeight:${props => props.height || '100%'};
`
export class Autosize extends React.Component { 

    constructor() {
        super()
        this.state = {}
        this.ref = createRef()
        this.onResizeHandler = this.onResize.bind(this)
        
    }

    componentDidMount(){
        const dimensions = this.getDimensions()
        if (dimensions) {
            const {width,height} = dimensions
            this.updateDimensions(width,height)

            if(width===undefined && height===undefined)
                return
            
            if (typeof (this.props?.onResize)==='function') {            
                this.props.onResize(width,height) 
            }
    
        }        

        window.addEventListener("resize", this.onResizeHandler);    
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResizeHandler);
        
    }

    isFixed() {
        if ( (typeof (this.props?.width)==='number')  && (typeof (this.props?.width)==='number') ) 
            return true;        

        if ( (typeof (this.props?.width)==='string' && this.props.width.endsWith('px')) && 
             (typeof (this.props?.height)==='string' && this.props.height.endsWith('px')) )
            return true
    }

    updateDimensions(width, height) { 
        this.setState( {width,height})

    }

    getDimensions() { 

        if (this.isFixed())
            return;
        
        const current = this.ref?.current
        const parent = current?.parentElement ??{};

        const width = this.props.width ? current.clientWidth : parent.clientWidth;
        const height = this.props.height ? current.clientHeight : parent.clientHeight;

        return {width,height}
    }

    onResize() {
        if (this.isFixed()) return

        const {width,height} = this.getDimensions()
        if (width===this.state.width && height===this.state.height) 
            return

        if(width===undefined && height===undefined)
            return

        this.updateDimensions( width,height)

        if (typeof (this.props?.onResize)==='function') {
            this.props.onResize(width,height) 
        }

    }

    getSize( name) {
        const props = this.props??{}
        const state = this.state??{}
        const sizeProp = props[name]
        const sizeState = state[name]

        let size, divSize
        if ( typeof (sizeProp) ==='number')  {
            divSize = `${sizeProp}px`
            size = sizeProp
        }
        else if (typeof (sizeProp)==='string' && sizeProp.endsWith('px')) { 
            divSize = sizeProp
            size = sizeState ?? Number(sizeProp.replace('px',''))
        }
        else  {
            divSize = sizeProp ?? '100%'
            size = sizeState
        }        
        return [size,divSize]

    }

    renderChildren(width,height) { 
        const {children,hidden} = this.props

        const childProps = copyPropsExcluding(this.props,['children','hidden','width','height'])

        if (!children)  
            return null;

        if (typeof children ==='string' || typeof children ==='number')
            return children



        if ( Array.isArray(children)) {
            try {
                return children.map ( (child,idx) => {
                    if (typeof child ==='string' || typeof child ==='number' || !child)
                        return child

                    const ChildElement = child.type;                    
                    const Child = hidden ? styled(ChildElement)`opacity:0;` : ChildElement
        
                    
                    return <Child key={idx} {...child.props} {...childProps} width={width} height={height} />;
                })    
            }
            catch (e) {
                console.error(e)
                return null
            }
        }
        else {
            try {
                
                const ChildElement = children.type;
                const Child = hidden ? styled(ChildElement)`opacity:0;` : ChildElement
            
                return <Child {...children.props} {...childProps} width={width} height={height}/>;

            }
            catch (e) {
                console.error(e)
                return null
            }
        }
    
    }

    render( ) {
        const [width, divWidth] = this.getSize('width')
        const [height, divHeight] = this.getSize('height')

        return(
        <Container width={divWidth} height={divHeight} ref={this.ref}>
            {this.renderChildren(width,height)}
        </Container>
        )
    }

}