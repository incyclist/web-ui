import React, { useEffect, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift,
    useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import { Pill } from '../../../atoms/Pill'
import { UrlLink } from '../../../atoms/Links/UrlLink'

const supportsPopover = typeof HTMLElement !== 'undefined'
    && 'popover' in HTMLElement.prototype && typeof HTMLElement.prototype.showPopover === 'function'

const InfoButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    margin: 0 0 1vh 0.8ch;
    align-self: center;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid ${props => props.theme.url.color};
        outline-offset: 2px;
    }
    color: ${props => props.theme.colors.infoText};
`

const InfoPopup = styled.div`
    inset: auto;
    margin: 0;
    box-sizing: border-box;
    width: 360px;
    max-width: calc(100vw - 16px);
    max-height: calc(100dvh - 16px);
    overflow: auto;
    padding: 8px 12px;
    background: ${props => props.theme.dialog.background};
    color: ${props => props.theme.dialog.text};
    border: ${props => props.theme.dialog.border};
    border-radius: ${props => props.theme.dialog.borderRadius};
    font-size: 14px;
    line-height: 1.5;
    text-align: left;
    z-index: 1000;

    ul { margin: 0 0 8px; padding-left: 20px; }
    li + li { margin-top: 8px; }
`

export const MapsApiKeyInfo = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { refs, elements, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'bottom-end',
        strategy: 'fixed',
        middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    })
    const click = useClick(context)
    // The settings dialog handles Escape on keyup, so consume that same event first.
    const dismiss = useDismiss(context, { escapeKey: false })
    const role = useRole(context, { role: 'dialog' })
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])

    useEffect(() => {
        if (!isOpen)
            return
        const onEscape = event => {
            if (event.key !== 'Escape')
                return
            event.stopPropagation()
            setIsOpen(false)
            refs.domReference.current?.focus()
        }
        document.addEventListener('keyup', onEscape, true)
        return () => document.removeEventListener('keyup', onEscape, true)
    }, [isOpen, refs])

    useLayoutEffect(() => {
        // Native top-layer rendering where supported; the portal also supports older browsers.
        if (isOpen)
            elements.floating?.showPopover?.()
    }, [isOpen, elements.floating])

    return <>
        <InfoButton ref={refs.setReference} type='button'
            {...getReferenceProps({ 'aria-label': 'About Maps API Key' })}>
            <Pill status='info' text='Info' fontSize='max(12px, 1.3vh)' />
        </InfoButton>
        {isOpen ? <FloatingPortal>
            <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                <InfoPopup ref={refs.setFloating} popover={supportsPopover ? 'manual' : undefined} style={floatingStyles}
                    {...getFloatingProps({ 'aria-label': 'About Maps API Key' })}>
                    <ul>
                        <li>Your own API key is required to simulate GPX rides with Street View or Satellite View.</li>
                        <li>Your own API key is required to enable side views (left and right).</li>
                        <li>Using your own API key reduces the risk of Incyclist running out of its shared free tier allowance.</li>
                    </ul>
                    <UrlLink text='Learn more about using your own Maps API key'
                        url='https://incyclist.com/faq/#street-view-simulate' />
                </InfoPopup>
            </FloatingFocusManager>
        </FloatingPortal> : null}
    </>
}
