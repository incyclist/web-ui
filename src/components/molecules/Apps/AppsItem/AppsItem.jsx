import React, { useId } from 'react'
import styled from 'styled-components'
import { ChevronRightIcon } from '@primer/octicons-react'
import { AppThemeProvider } from '../../../../theme'

const Container = styled.div`
    border-bottom: 1px solid rgba(128, 128, 128, 0.4);
`

// The header is a native button (accordion pattern): it gets keyboard handling (Enter, Space) and focus behaviour from the browser.
// It is deliberately not the Button atom: that one is an action button (filled, 3D hover), whereas this is a list row that discloses a section
const Header = styled.button`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 1.6vh 1vw;
    border: none;
    border-radius: 0;
    font: inherit;
    font-size: 2.4vh;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    user-select: none;
    color: ${props => props.theme.list.normal.text};
    background: ${props => props.theme.list.normal.background};

    &:hover {
        color: ${props => props.theme.list.hover.text};
        background: ${props => props.theme.list.hover.background};
    }

    &:focus-visible {
        color: ${props => props.theme.list.hover.text};
        background: ${props => props.theme.list.hover.background};
        outline: 2px solid currentColor;
        outline-offset: -4px;
    }
`

const Name = styled.span`
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

    const id = useId()
    const headerId = `${id}-header`
    const panelId = `${id}-panel`

    return <AppThemeProvider>
        <Container>
            <Header id={headerId} type='button' aria-expanded={expanded} aria-controls={expanded ? panelId : undefined} onClick={() => onClick?.()}>
                <Name>
                    <span>{name}</span>
                    <Status role='img' aria-label={isConnected ? 'Connected' : 'Not connected'} $connected={isConnected} />
                </Name>
                <Chevron $expanded={expanded} aria-hidden='true'><ChevronRightIcon size={24} /></Chevron>
            </Header>

            {expanded ? <Body id={panelId} role='region' aria-labelledby={headerId}>{children}</Body> : null}
        </Container>
    </AppThemeProvider>
}
