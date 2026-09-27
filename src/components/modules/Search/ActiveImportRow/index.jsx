import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Loader from 'react-spinners/ClipLoader'
import { TrashIcon } from '@primer/octicons-react'
import { Button, Icon, Text } from '../../../atoms'
import { AppThemeProvider } from '../../../../theme'

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1vw;
    height: 5vh;
    min-height: 5vh;
    width: calc(100% - 2.5vw);
    margin-top: 0.5vh;
    padding: 0 1vw;
    box-sizing: border-box;
    background: ${props => props.theme?.pageLists?.background || 'linear-gradient(darkred,#180457)'};
    color: white;
    user-select: none;
`

const Name = styled.div`
    flex: 0 1 auto;
    min-width: 10vw;
    max-width: 40%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 2vh;
    font-weight: bold;
`

const ErrorMessage = styled.div`
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: red;
    font-size: 1.6vh;
`

const Status = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
`

/**
 * An in-flight (or failed) import, shown as a row pinned above the route list - never sorted
 * into it. Tracks the import card's own update events, so a failure is shown without the
 * list being re-rendered.
 */
export const ActiveImportRow = ({card, onRetry, onDelete}) => {

    const [props,setProps] = useState( ()=> card?.getDisplayProperties?.() ?? {})

    useEffect( ()=>{
        const observer = card?.getDisplayProperties?.()?.observer
        if (!observer)
            return

        const onUpdate = (updated) => { setProps( current => ({...current,...updated})) }
        observer.on('update', onUpdate)
        return ()=>{ observer.off('update', onUpdate) }
    },[card])

    const {name,error} = props

    return (
        <AppThemeProvider>
            <Container className='active-import'>
                <Name title={name}>{name}</Name>
                {error ?
                    <>
                        <Text color='red' bold={true}>Error</Text>
                        <ErrorMessage title={error.message}>{error.message}</ErrorMessage>
                        <Button text='Retry' size='small' logContext={{name}} onClick={()=>onRetry?.(card)} />
                        <Icon height={20} margin={0} padding={0} onClick={()=>onDelete?.(card)}><TrashIcon size={20}/></Icon>
                    </>
                    :
                    <Status><Loader size={20} color='white'/></Status>
                }
            </Container>
        </AppThemeProvider>
    )
}
