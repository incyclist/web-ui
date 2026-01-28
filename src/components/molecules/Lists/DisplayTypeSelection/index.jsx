import React from "react"
import { AppsIcon, ThreeBarsIcon } from "@primer/octicons-react"
import { Button, Row } from "../../../atoms"
import styled from "styled-components"
import { AppThemeProvider } from "../../../../theme"

const ListIcon = styled(ThreeBarsIcon)`
    background: ${props => props.selected ? props.theme?.navbar?.selected?.background : props.theme?.navbar?.normal?.background}; 
    fill: ${props => props.selected ? props.theme?.navbar?.selected?.text : props.theme?.navbar?.normal?.text}; 
`

const TilesIcon = styled(AppsIcon)`
    background: ${props => props.selected ? props.theme?.navbar?.selected?.background : props.theme?.navbar?.normal?.background}; 
    fill: ${props => props.selected ? props.theme?.navbar?.selected?.text : props.theme?.navbar?.normal?.text}; 
`

const View = styled(Button)`
    background: none;
    border:none;

    height: auto;
    min-height: auto;
    padding: 2px;
    margin: 0;
    &:hover {
        background: ${props => props.backgroundHover||props.theme?.button?.hover?.background};
    }

`
export const DisplayTypeSelection = ( {size=24, selected, onSelected, logContext}) => {

    const onListClicked = () => {
        if (typeof onSelected === 'function') {
            onSelected('list')
        }
        else {
            console.log(typeof onSelected,onSelected )
        }
    }
    const onTilesClicked = () => {
        if (typeof onSelected === 'function') {
            onSelected('tiles')
        }
    }

    return (
        <AppThemeProvider>
            <Row>
                <View id='list' onClick={onListClicked} logContext={logContext} >
                    <ListIcon className='icnList' selected={selected==='list'}  verticalAlign="middle" size={size} />
                </View>
                <View id='tiles' onClick={onTilesClicked} logContext={logContext} >
                    <TilesIcon className='icnTiles' selected={selected==='tiles'}  verticalAlign="middle"size={size}/>
                </View>
            </Row>
        </AppThemeProvider>
        
    )
}