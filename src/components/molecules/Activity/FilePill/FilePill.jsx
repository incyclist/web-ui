import React, {  useState } from "react"
import { Column, Loader, Pill, Text } from "../../../atoms"
import { useFloating,   useHover, useClick,
    useInteractions,
    safePolygon} from '@floating-ui/react';
import styled from "styled-components";
import { AppThemeProvider } from "../../../../theme";
import { copyPropsExcluding } from "../../../../utils/props";
import { EventLogger } from "gd-eventlog";


const Container = styled.div`
    user-select: none;
` 

const FloatingContainer = styled(Column)`
    background: ${props => props.color??props.theme.menu.background};
    color: ${props => props.color??props.theme.menu.text};
    border: ${props => props.theme.menu.border || 'rgb(0,0,0) 1px solid'};
    border-radius: ${props => props.theme.menu?.borderRadius};
    z-index: 1000;
`

const PillContainer = styled.div`
    width: min-content;
    height: min-content;
    opacity: ${props => props.isLoading ? 0.5 : 1};   
    user-select: none;
    position: ${props => props.isLoading ? 'relative' : undefined };
`

const LoaderContainer = styled.div`  
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`
const MenuItem = styled(Text)`  
    :hover {background: ${props => props.selected ? props.theme.menu.selected.background : props.theme.menu.hover.background}};
`

export const FilePill = ( props) => {

    const logger = new EventLogger('Incyclist')

    const [isOpen, setIsOpen] = useState(false)
    const {refs, floatingStyles,context} = useFloating({
            placement: 'bottom-start',
            open: isOpen,
            strategy: 'absolute',
            onOpenChange: setIsOpen
        });

    const click = useClick(context)
    const hover = useHover(context,{  handleClose: safePolygon({
        requireIntent: false,
      }),})

    const {getReferenceProps, getFloatingProps} = useInteractions([click,hover]);
    

    const pillProps = copyPropsExcluding(props,['onOpen','onCreate','canOpen','canCreate','loading'])
    const {onOpen, onCreate,canOpen, canCreate,loading} = props
    const isDeactivated = (!canOpen && !canCreate) || loading


    const onOpenHandler = () => { 
        logger.logEvent({message:'pill clicked', pill: `open: ${pillProps.text}`, eventSource:'user'})
        setIsOpen(false)
        if (typeof onOpen === 'function') {
            onOpen()
        }
    }

    const onCreateHandler = () => { 
        logger.logEvent({message:'pill clicked', pill: `create: ${pillProps.text}`, eventSource:'user'})
        setIsOpen(false)
        if (typeof onCreate === 'function') {
            onCreate()
        }
    }

    const floatingRef = !isDeactivated ? refs?.setReference : null
    const referenceProps = !isDeactivated ? getReferenceProps() : {}

    return (
        <AppThemeProvider>
            <Container classname='pill-container'>
                <PillContainer ref={floatingRef} {...referenceProps} isLoading={loading}>                
                        <Pill  size='small' margin='0.2vh 0.2vh' {...pillProps} />                    
                        {loading ? <LoaderContainer><Loader size='1vh' color={'black'} /></LoaderContainer> : null}    
                </PillContainer>
                
                { isOpen && !isDeactivated ?
                <div ref={refs.setFloating}  {...getFloatingProps()} style={{...floatingStyles}}>            

                        <FloatingContainer  height='auto' margin='0' padding='0'>
                            {canCreate ? <MenuItem size='small' margin='0.2vh 0.2vw' onClick={onCreateHandler}>Create</MenuItem> : null}
                            {canOpen?<MenuItem size='small' margin='0.2vh 0.2vw' onClick={onOpenHandler}>Show</MenuItem>: null}
                        </FloatingContainer> 
                        
                </div> : null}
            </Container>
        </AppThemeProvider>
    )
}