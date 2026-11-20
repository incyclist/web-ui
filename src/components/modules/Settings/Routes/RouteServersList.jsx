import React from 'react'
import styled, { keyframes } from 'styled-components'
import { Button, LinkButton } from '../../../atoms'

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
`

const Header = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 1vw;
`

const Title = styled.div`
    font-size: 2.6vh;
    font-weight: 500;
`

const Description = styled.div`
    font-size: 1.8vh;
    opacity: 0.8;
    padding: 0.5vh 1vw 1.5vh 1vw;
`

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1vw;
    padding: 1.4vh 1vw;
    border-bottom: 1px solid rgba(128, 128, 128, 0.4);
    font-size: 2.2vh;
`

const Dot = styled.span`
    flex: none;
    width: 1.4vh;
    height: 1.4vh;
    border-radius: 50%;
    background: ${props => props.$color};
    animation: ${props => props.$pulse ? pulse : 'none'} 1.2s ease-in-out infinite;
`

const Identity = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
`

const NameLine = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.8vw;
`

const Host = styled.div`
    font-size: 1.6vh;
    opacity: 0.7;
    overflow: hidden;
    text-overflow: ellipsis;
`

const Tag = styled.span`
    font-size: 1.4vh;
    padding: 0.2vh 0.6vw;
    border-radius: 1vh;
    border: 1px solid rgba(128, 128, 128, 0.7);
    opacity: 0.8;
    white-space: nowrap;
`

const StatusText = styled.div`
    flex: 0 1 38%;
    font-size: 1.7vh;
    text-align: right;
    opacity: 0.9;
`

const RemoveArea = styled.div`
    flex: none;
    width: 7vw;
    text-align: right;
    font-size: 1.8vh;
`

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1vh;
    padding: 3vh 1vw 1vh 1vw;
`

const EmptyTitle = styled.div`
    font-size: 2.4vh;
    font-weight: 500;
`

const EmptyText = styled.div`
    font-size: 1.9vh;
    max-width: 50vw;
    opacity: 0.85;
`

const AMBER = '#e0a000'
const GREEN = 'green'
const GREY = 'lightgrey'

const dotColor = (status) => {
    if (status === 'unreachable')
        return AMBER
    if (status === 'ok' || status === 'empty')
        return GREEN
    return GREY
}

const RouteServerRow = ({ server, onRemove }) => {
    const tags = [server.tag, server.note].filter(Boolean)

    return <Row data-testid={`server-${server.key}`}>
        <Dot role='img' aria-label={server.statusText} $color={dotColor(server.status)} $pulse={server.status === 'loading'} />
        <Identity>
            <NameLine>
                <span>{server.name}</span>
                {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
            </NameLine>
            {server.host ? <Host>{server.host}</Host> : null}
        </Identity>
        <StatusText>{server.statusText}</StatusText>
        <RemoveArea>
            {server.canRemove ? <LinkButton label='Remove' ariaLabel={`Remove ${server.name}`} onClick={() => onRemove?.(server.key)} /> : null}
        </RemoveArea>
    </Row>
}

/**
 * Panel "Route Servers" of the Routes settings: the built-in server, the servers the user added and (as long as
 * there are none) a short explanation with the primary "Add route server" button.
 */
export const RouteServersList = ({ servers = [], isEmpty, emptyState, onAdd, onRemove }) => {
    return <>
        <Header>
            <Title>Route Servers</Title>
            {isEmpty ? null : <Button text='Add route server' secondary={true} onClick={() => onAdd?.()} />}
        </Header>
        <Description>Collections of routes hosted by other riders and groups.</Description>

        {servers.map(server =>
            <RouteServerRow key={server.key} server={server} onRemove={onRemove} />
        )}

        {isEmpty && emptyState ?
            <EmptyState>
                <EmptyTitle>{emptyState.title}</EmptyTitle>
                <EmptyText>{emptyState.text}</EmptyText>
                <Button text='Add route server' primary={true} onClick={() => onAdd?.()} />
            </EmptyState> : null
        }
    </>
}
