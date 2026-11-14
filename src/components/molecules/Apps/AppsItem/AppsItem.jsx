import React from 'react'
import styled from 'styled-components'
import { ChevronRightIcon } from '@primer/octicons-react'
import { AppThemeProvider } from '../../../../theme'

const Container = styled.div`
    border-bottom: 1px solid rgba(128, 128, 128, 0.4);
`

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.6vh 1vw;
    font-size: 2.4vh;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    color: ${props => props.theme.list.normal.text};
    background: ${props => props.theme.list.normal.background};

    &:hover,
    &:focus-visible {
        color: ${props => props.theme.list.hover.text};
        background: ${props => props.theme.list.hover.background};
        outline: none;
    }
`

const Name = styled.div`
    display: flex;
    align-items: center;
`

const Status = styled.span`
    display: inline-block;
    width: 1.4vh;
    height: 1.4vh;
    margin-left: 1vw;
    border-radius: 50%;
    background: ${props => props.$connected
        ? (props.theme.colors?.success ?? 'green')
        : (props.theme.colors?.disabledButton ?? 'lightgrey')};
`

const Chevron = styled.span`
    display: inline-flex;
    transition: transform 0.2s;
    transform: ${props => props.$expanded ? 'rotate(90deg)' : 'none'};
`

const Body = styled.div`
    padding: 0 1vw 1.6vh 1vw;
`

/**
 * One entry of the Apps list: app name, connection status and a chevron.
 * Clicking the header expands/collapses the settings of the app (passed as children).
 */
export const AppsItem = ({ name, isConnected = false, expanded = false, onClick, children }) => {

    const onKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.()
        }
    }

    return <AppThemeProvider>
        <Container>
            <Header role='button' tabIndex={0} aria-expanded={expanded} onClick={() => onClick?.()} onKeyDown={onKeyDown}>
                <Name>
                    <span>{name}</span>
                    <Status role='img' aria-label={isConnected ? 'Connected' : 'Not connected'} $connected={isConnected} />
                </Name>
                <Chevron $expanded={expanded}><ChevronRightIcon size={24} /></Chevron>
            </Header>

            {expanded ? <Body>{children}</Body> : null}
        </Container>
    </AppThemeProvider>
}
