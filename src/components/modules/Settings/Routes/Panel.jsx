import React from 'react'
import styled, { keyframes } from 'styled-components'

// Building blocks shared by the panels of the Routes tab (Route Servers, Route Sharing), so both read as siblings:
// one bordered card per panel, a header with icon, title, description and the panel's action, and identical rows.

const RULE = '1px solid rgba(128, 128, 128, 0.4)'

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
`

const Card = styled.section`
    border: ${RULE};
    border-radius: 0.6vh;
    margin-bottom: 2vh;
`

const Header = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 1vw;
    padding: 1.2vh 1vw;
    border-bottom: ${RULE};
`

const IconArea = styled.span`
    flex: none;
    display: inline-flex;
    align-items: center;
`

const Title = styled.div`
    flex: none;
    font-size: 2.6vh;
    font-weight: 500;
    white-space: nowrap;
`

const Description = styled.div`
    flex: 1 1 20vw;
    min-width: 0;
    font-size: 1.8vh;
    opacity: 0.8;
`

const ActionArea = styled.div`
    flex: none;
    margin-left: auto;
`

/**
 * Card of one panel. `titleId` must be the id given to the header title, so that the card is announced by its name.
 */
export const Panel = ({ titleId, children, ...props }) =>
    <Card role='region' aria-labelledby={titleId} {...props}>{children}</Card>

/**
 * Header of a panel: icon, the panel's only heading, a one-line description and the panel's action (a secondary button).
 */
export const PanelHeader = ({ id, icon, title, description, action }) =>
    <Header>
        {icon ? <IconArea aria-hidden='true'>{icon}</IconArea> : null}
        <Title id={id}>{title}</Title>
        <Description>{description}</Description>
        {action ? <ActionArea>{action}</ActionArea> : null}
    </Header>

export const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1vw;
    padding: 1.4vh 1vw;
    border-bottom: ${RULE};
    font-size: 2.2vh;
    &:last-child { border-bottom: none; }
`

export const Dot = styled.span`
    flex: none;
    width: 1.4vh;
    height: 1.4vh;
    border-radius: 50%;
    background: ${props => props.$color};
    animation: ${props => props.$pulse ? pulse : 'none'} 1.2s ease-in-out infinite;
`

export const Identity = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
`

export const NameLine = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.8vw;
`

export const SubLine = styled.div`
    font-size: 1.6vh;
    opacity: 0.7;
    overflow: hidden;
    text-overflow: ellipsis;
`

export const StatusText = styled.div`
    flex: 0 1 38%;
    font-size: 1.7vh;
    text-align: right;
    opacity: 0.9;
`

export const RemoveArea = styled.div`
    flex: none;
    width: 7vw;
    text-align: right;
    font-size: 1.8vh;
`

/** One muted line below the rows of a panel: a hint, a note or a disclosure. */
export const BodyLine = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6vw;
    padding: 1vh 1vw;
    font-size: 1.8vh;
    opacity: 0.8;
`

/** Small muted label above a list inside a panel. It is not a heading. */
export const ListLabel = styled.div`
    padding: 1vh 1vw 0;
    font-size: 1.7vh;
    font-weight: 500;
    opacity: 0.7;
`

export const AMBER = '#e0a000'
export const GREEN = 'green'
export const GREY = 'lightgrey'
