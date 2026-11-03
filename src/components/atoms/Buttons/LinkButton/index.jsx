import React from 'react'
import styled from 'styled-components'
import { EventLogger } from 'gd-eventlog'
import { hasFeature, api } from '../../../../utils/electron/integration'

const DEFAULT_COLOR = '#8cc4ff'
const DISABLED_COLOR = '#888888'

// A real button (keyboard and screen reader support), styled like a text link
const Btn = styled.button`
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    text-align: inherit;
    cursor: pointer;
    color: ${props => props.$color ?? props.theme?.url?.color ?? DEFAULT_COLOR};
    text-decoration: ${props => props.$plain ? 'none' : 'underline'};

    &:hover {
        filter: brightness(1.25);
    }

    &:focus-visible {
        outline: 2px solid white;
        outline-offset: 2px;
    }

    &:disabled {
        color: ${DISABLED_COLOR};
        text-decoration: none;
        cursor: default;
        filter: none;
    }
`

const HiddenText = styled.span`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
`

const openExternal = (url) => {
    if (hasFeature('shell.openExternal'))
        api.shell.openExternal(url)
    else
        window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * A button that looks like a text link.
 *
 * Logs the standard 'button clicked' event (nothing else). If `external` is set, `onClick` is
 * called with nothing and the caller is expected to open the link - unless `url` is given, in
 * which case the link is opened in the browser.
 */
export const LinkButton = (props) => {
    const { label, onClick, disabled = false, external = false, url, color, logContext, id, plain = false, ariaLabel } = props

    const onClicked = (e) => {
        e.stopPropagation()
        if (disabled)
            return

        const logger = new EventLogger('Incyclist')
        logger.logEvent({ message: 'button clicked', button: label, ...logContext, eventSource: 'user' })

        if (url)
            openExternal(url)
        onClick?.(e)
    }

    const describedBy = external ? `${id ?? label}-external` : undefined

    return <>
        <Btn type='button' disabled={disabled} onClick={onClicked} $color={color} $plain={plain} aria-label={ariaLabel} aria-describedby={describedBy}>
            {label}{external ? ' ↗' : ''}
        </Btn>
        {external ? <HiddenText id={describedBy}>Opens in your browser</HiddenText> : null}
    </>
}
