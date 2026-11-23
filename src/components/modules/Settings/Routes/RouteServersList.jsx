import React from 'react'
import styled from 'styled-components'
import { CloudIcon } from '@primer/octicons-react'
import { Button, LinkButton } from '../../../atoms'
import {
    Panel, PanelHeader, Row, Dot, Identity, NameLine, SubLine, StatusText, RemoveArea, BodyLine, AMBER, GREEN, GREY
} from './Panel'

const Tag = styled.span`
    font-size: 1.4vh;
    padding: 0.2vh 0.6vw;
    border-radius: 1vh;
    border: 1px solid rgba(128, 128, 128, 0.7);
    opacity: 0.8;
    white-space: nowrap;
`

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
            {server.host ? <SubLine>{server.host}</SubLine> : null}
        </Identity>
        <StatusText>{server.statusText}</StatusText>
        <RemoveArea>
            {server.canRemove ? <LinkButton label='Remove' ariaLabel={`Remove ${server.name}`} onClick={() => onRemove?.(server.key)} /> : null}
        </RemoveArea>
    </Row>
}

const PANEL_DESCRIPTION = 'Collections of routes hosted by other riders and groups.'
const TITLE_ID = 'route-servers-title'

/**
 * Panel "Route Servers" of the Routes settings: a card with the built-in server and the servers the user added. The
 * secondary "Add route server" button is always in the header; while there are no added servers, one plain line
 * explains what a route server is (the empty state's title is not shown here).
 */
export const RouteServersList = ({ servers = [], isEmpty, emptyState, onAdd, onRemove }) => {
    return <Panel titleId={TITLE_ID}>
        <PanelHeader id={TITLE_ID} icon={<CloudIcon size={24} />} title='Route Servers' description={PANEL_DESCRIPTION}
            action={<Button text='Add route server' secondary={true} onClick={() => onAdd?.()} />} />

        {servers.map(server =>
            <RouteServerRow key={server.key} server={server} onRemove={onRemove} />
        )}

        {isEmpty && emptyState?.text ? <BodyLine>{emptyState.text}</BodyLine> : null}
    </Panel>
}
