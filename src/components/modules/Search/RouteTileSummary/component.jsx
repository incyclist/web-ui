import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { css } from 'styled-components'
import Flag from 'react-world-flags'
import { ArrowRightIcon, TrashIcon, PeopleIcon, PlayIcon } from '@primer/octicons-react'
import { FreeMap } from '../../../molecules/Maps'
import { ErrorBoundary, Loader } from '../../../atoms'
import { CardSkeleton } from '../../routeSelection/base/skeleton'
import AppTheme from '../../../../theme'

const finite = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
const validCoordinates = points => (points || []).filter(point =>
    finite(point.lat) && finite(point.lng) && Math.abs(Number(point.lat)) <= 90 && Math.abs(Number(point.lng)) <= 180)
const profilePoints = points => (points || []).filter(point => finite(point.routeDistance) && finite(point.elevation))
const countryLabel = country => {
    if (!country) return undefined
    const code = country.toUpperCase() === 'UK' ? 'GB' : country.toUpperCase()
    try { return { code, name: new Intl.DisplayNames(['en'], { type: 'region' }).of(code) } }
    catch { return { code, name: country } }
}
const videoPillLabels = { 'in-icloud': 'In iCloud', downloading: 'Downloading…' }

const Surface = styled.article`
    position: relative; display: flex; flex-direction: column; box-sizing: border-box;
    width: 100%; height: 100%; overflow: hidden; border-radius: 12px;
    background: #171321; border: 1px solid #3a3248; color: #f7f5fa; text-align: left;
    font-family: inherit; cursor: pointer; isolation: isolate;
    &:hover, &:focus-within { border-color: #cba15c; }
    &:focus-visible { outline: 3px solid #efc580; outline-offset: -3px; }
    button { font-family: inherit; cursor: pointer; }
    button:focus-visible { outline: 3px solid #efc580; outline-offset: 2px; }
    button:disabled { cursor: default; opacity: .5; }
    ${p => p.$list && css`
        flex-direction: row;
        height: 112px;
        min-height: 112px;
        &:hover, &:focus-within { border-color: ${p.theme?.button?.primary?.background ?? '#dd9933'}; }
    `}
`
const Preview = styled.div`
    position: relative; width: 100%; height: 132px; flex-shrink: 0;
    overflow: hidden; background: #252330;
    > img { display: block; width: 100%; height: 100%; object-fit: cover; }
    ${p => p.$list && css`
        width: 148px;
        height: 100%;
        flex: 0 0 148px;
        @media (max-width: 900px) { width: 124px; flex-basis: 124px; }
    `}
`
const MapPreview = styled.div`
    width: 100%; height: 100%; pointer-events: none;
`
const Placeholder = styled.div`
    height: 100%; display: flex; flex-direction: column; gap: 8px; align-items: center;
    justify-content: center; color: #b9b1c8; font-size: 13px;
    background: radial-gradient(ellipse at 30% 20%, #3a3147, #242030 75%);
`
const MediaBadge = styled.span`
    position: absolute; z-index: 1001; top: 12px; left: 12px;
    display: inline-flex; align-items: center; gap: 5px; padding: 6px 9px;
    background: rgba(19,16,27,.88); border: 1px solid #75697f; border-radius: 6px;
    font-size: 11px; font-weight: 700; letter-spacing: .6px;
`
const IconButton = styled.button`
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 38px; height: 38px; border: 1px solid #5c506a; border-radius: 8px;
    background: #272031; color: #ede8f4;
    &:hover { background: #3b3048; }
`
const Body = styled.div`
    display: flex; flex: 1; flex-direction: column; padding: 11px 12px; gap: 8px; min-height: 0;
    ${p => p.$list && css`
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(125px, .85fr) minmax(125px, 1fr) auto;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        min-width: 0;
        @media (max-width: 1100px) {
            grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
            grid-template-rows: 1fr 1fr;
            gap: 0 12px;
            > :first-child { grid-column: 1; grid-row: 1; }
            > :nth-child(2) { grid-column: 1; grid-row: 2; }
            > :nth-child(3) { grid-column: 2; grid-row: 1; }
            > :nth-child(4) { grid-column: 2; grid-row: 2; }
        }
    `}
`
const Heading = styled.h3`
    font-size: 17px; line-height: 1.2; font-weight: 650; margin: 0; min-height: 39px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; overflow-wrap: anywhere;
    ${p => p.$list && css`
        display: block;
        min-height: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 17px;
        line-height: 1.2;
    `}
`
const Location = styled.div`
    display: flex; gap: 7px; align-items: center; color: #bfb6ce; font-size: 12px; min-height: 20px;
    img { border-radius: 2px; max-width: 22px; }
`
const RouteKind = styled.span`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &::before { content: '·'; margin: 0 5px 0 2px; }
`
const Stats = styled.div`
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    strong { display: block; font-size: 20px; font-weight: 650; letter-spacing: -.5px; }
    small { display: block; margin-top: 3px; font-size: 11px; color: #bfb6ce; }
    ${p => p.$list && css`
        gap: 7px;
        min-width: 0;
        strong { font-size: 17px; white-space: nowrap; }
        small { margin-top: 1px; font-size: 10px; }
    `}
`
const Profile = styled.div`
    height: 42px; flex-shrink: 0;
    svg { display: block; width: 100%; height: 27px; overflow: visible; }
    small { color: #a99db9; display: block; font-size: 10px; margin-top: 3px; }
    ${p => p.$list && css`
        height: 40px;
        min-width: 0;
        svg { height: 25px; }
        small { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 9px; }
    `}
`
const StatusRow = styled.div`
    position: absolute; z-index: 1001; bottom: 8px; left: 8px; right: 8px;
    display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
    font-size: 11px; color: #beb5cc;
`
const Badge = styled.span`
    display: inline-flex; align-items: center; gap: 4px; padding: 4px 7px; border-radius: 5px;
    color: ${p => p.$live ? '#b2f1cf' : '#f7e0af'};
    background: ${p => p.$live ? 'rgba(18,55,42,.94)' : 'rgba(42,32,32,.94)'}; font-weight: 600;
`
const Actions = styled.div`
    display: flex; gap: 8px; margin-top: auto; padding-top: 2px;
    ${p => p.$list && css`
        align-items: center;
        margin: 0;
        padding: 0;
        white-space: nowrap;
    `}
`
const OpenButton = styled.button`
    display: flex; align-items: center; justify-content: center; gap: 10px;
    height: 38px; flex: 1; border-radius: 7px; border: 1px solid transparent;
    color: ${p => p.theme?.button?.primary?.text ?? AppTheme.get().button.primary.text};
    background: ${p => p.theme?.button?.primary?.background ?? AppTheme.get().button.primary.background};
    font-size: 13px; font-weight: 650;
    &:hover { background: ${p => p.theme?.button?.hover?.background ?? AppTheme.get().button.hover.background}; }
    ${p => p.$list && css`
        padding: 0 10px;
        white-space: nowrap;
    `}
`
const Confirmation = styled.div`
    position: absolute; z-index: 1100; inset: 0; cursor: default; line-height: 1.5;
    inset: 0; display: flex; flex-direction: column; justify-content: center; border-radius: 11px;
    background: #211a2d; padding: 20px;
    strong { font-size: 18px; margin-bottom: 12px; }
    div { display: flex; gap: 8px; }
    button { min-height: 40px; flex: 1; border: 1px solid #6b5e7a; border-radius: 6px; background: #393043; color: white; text-align: center; }
    button:last-child { background: #9b3443; }
    ${p => p.$list && css`
        position: relative;
        inset: auto;
        box-sizing: border-box;
        width: min(420px, calc(100vw - 2rem));
        min-height: 215px;
        border: 1px solid #70617e;
        box-shadow: 0 18px 60px #000b;
    `}
`

const ConfirmationBackdrop = styled.div`
    position: fixed;
    z-index: 10000;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(8, 6, 14, .68);
`

export const RouteProfile = ({ points, list = false }) => {
    const id = useId().replace(/:/g, '')
    const data = profilePoints(points)
    if (data.length < 2) return <Profile $list={list}><small>Elevation profile unavailable</small></Profile>
    const minX = data[0].routeDistance, maxX = data[data.length - 1].routeDistance
    const { min, max } = data.reduce((bounds, p) => ({ min: Math.min(bounds.min, Number(p.elevation)), max: Math.max(bounds.max, Number(p.elevation)) }), { min: Infinity, max: -Infinity })
    // Keep a minimum 100 m scale so minor undulations do not look like major climbs.
    const range = Math.max(100, max - min)
    const stride = Math.max(1, Math.ceil(data.length / 250))
    const line = data.filter((p, i) => i % stride === 0 || i === data.length - 1).map(p => `${((p.routeDistance - minX) / (maxX - minX || 1) * 250).toFixed(2)},${(30 - (p.elevation - min) / range * 28).toFixed(2)}`).join(' ')
    return <Profile $list={list} aria-label={`Elevation profile, ${Math.round(min)} to ${Math.round(max)} metres`}>
        <svg viewBox='0 0 250 32' preserveAspectRatio='none' role='img' aria-label='Elevation profile'>
            <defs><linearGradient id={id} x1='0' y1='0' x2='0' y2='1'><stop stopColor='#c29a60' stopOpacity='.38' /><stop offset='1' stopColor='#c29a60' stopOpacity='.04' /></linearGradient></defs>
            <polygon points={`0,32 ${line} 250,32`} fill={`url(#${id})`} />
            <polyline points={line} fill='none' stroke='#d4b27c' strokeWidth='1.5' vectorEffect='non-scaling-stroke' />
        </svg>
        <small>Elevation profile · {Math.round(min)}–{Math.round(max)} m</small>
    </Profile>
}

const formatMetric = (formatted, value, divisor, unit, digits) => {
    if (formatted?.value != null && Number.isFinite(Number(formatted.value))) return `${formatted.value} ${formatted.unit || unit}`
    return value != null && Number.isFinite(Number(value)) ? `${new Intl.NumberFormat('en', { maximumFractionDigits: digits }).format(Number(value) / divisor)} ${unit}` : '—'
}

export const RouteTileSummaryView = (props) => {
    const { id, title = 'Untitled route', country, distance, elevation, totalDistance, totalElevation,
        previewUrl, visible, hasVideo, isDemo, isNew, cntActive, videoPill, sourceLabel,
        shape, details = {}, canDelete = false, buttonText = 'View details', onClick, onOK, onDelete, layout } = props
    const list = layout === 'list'
    const [imageFailed, setImageFailed] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const deleteRef = useRef(null)
    const cancelRef = useRef(null)
    const confirmRef = useRef(null)
    const hasShape = Array.isArray(shape) && shape.length > 0
    useEffect(() => { setImageFailed(false) }, [previewUrl, id])
    useEffect(() => {
        if (confirmDelete) cancelRef.current?.focus()
    }, [confirmDelete])

    const points = hasShape ? shape : (details.points ?? props.points ?? [])
    const coordinates = useMemo(() => validCoordinates(points), [points])
    const isVideo = Boolean(hasVideo)
    const renderImage = isVideo && previewUrl && !imageFailed
    const renderMap = !renderImage && coordinates.length >= 2
    const location = countryLabel(country)
    const closeOptions = () => { setConfirmDelete(false); deleteRef.current?.focus() }
    const open = e => {
        if (confirmDelete) return
        if (onOK) onOK(e)
        else onClick?.(id)
    }
    const stop = e => e.stopPropagation()
    const onDialogKey = e => {
        e.stopPropagation()
        if (e.key === 'Escape') closeOptions()
        if (e.key === 'Tab' && confirmDelete) {
            e.preventDefault()
            if (document.activeElement === cancelRef.current) confirmRef.current?.focus()
            else cancelRef.current?.focus()
        }
    }
    if (visible === false) return <div style={{ width: props.width, height: props.height }}><CardSkeleton /></div>

    return <ErrorBoundary hideOnError>
        <Surface $list={list} className={list ? 'route-summary route-list-item' : 'route-summary'} aria-label={`Route ${title}`} tabIndex={0} onClick={open}
            onKeyDown={e => { if (e.target === e.currentTarget && ['Enter', ' '].includes(e.key)) { e.preventDefault(); open(e) } }}>
            <Preview $list={list} inert={confirmDelete}>
                {renderImage ? <img src={previewUrl} alt={title} onError={() => setImageFailed(true)} draggable={false} /> :
                    renderMap ? <MapPreview><FreeMap noAttribution scrollWheelZoom={false} zoomControl={false} points={coordinates} startPos={0} draggable={false} /></MapPreview> :
                        <Placeholder>{details.loading ? <Loader size={26} /> : <><img src='images/route.svg' alt='' width='28' height='28' /><span>{isVideo ? 'Video Route' : 'Map unavailable'}</span></>}</Placeholder>}
                <MediaBadge>{isVideo ? <><PlayIcon size={12} /> VIDEO</> : 'GPX'}</MediaBadge>
                <StatusRow>
                    {isNew ? <Badge>New</Badge> : null}{isDemo ? <Badge>Demo</Badge> : null}
                    {videoPillLabels[videoPill] ? <Badge>{videoPillLabels[videoPill]}</Badge> : null}
                    {sourceLabel ? <Badge>{sourceLabel}</Badge> : null}
                    {cntActive > 0 ? <Badge $live style={{ marginLeft: 'auto' }}><PeopleIcon size={12} />{cntActive} live</Badge> : null}
                </StatusRow>
            </Preview>
            <Body $list={list} inert={confirmDelete}>
                <div style={{minWidth:0}}><Heading $list={list} title={title}>{title}</Heading><Location>{location ? <><Flag code={location.code} height='13' alt='' />{location.name}</> : 'Location unavailable'}{list && typeof props.isLoop === 'boolean' ? <RouteKind>{props.isLoop ? 'Loop' : 'Point to point'}</RouteKind> : null}</Location></div>
                <Stats $list={list}>
                    <div><strong>{formatMetric(totalDistance, distance, 1000, 'km', 1)}</strong><small>Distance</small></div>
                    <div><strong>{formatMetric(totalElevation, elevation, 1, 'm', 0)}</strong><small>Total ascent</small></div>
                </Stats>
                <RouteProfile points={points} list={list} />
                <Actions $list={list}>
                    {onOK || onClick ? <OpenButton $list={list} type='button' onClick={e => { stop(e); open(e) }} aria-label={`View details for ${title}`}>{list ? 'Details' : buttonText}<ArrowRightIcon size={16} /></OpenButton> : null}
                    {canDelete && onDelete ? <IconButton ref={deleteRef} type='button' aria-label={`Delete ${title}`} aria-haspopup='dialog'
                        onClick={e => { stop(e); setConfirmDelete(true) }}><TrashIcon size={17} /></IconButton>
                    : null}
                </Actions>
            </Body>
            {confirmDelete && !list ? <Confirmation role='alertdialog' aria-modal='true' aria-label={`Delete ${title}?`} onClick={stop} onKeyDown={onDialogKey}>
                <strong>Delete this route?</strong><p>{title}</p><p>This removes the route from your library. A downloaded route also has its downloaded video removed.</p>
                <div><button ref={cancelRef} type='button' onClick={closeOptions}>Cancel</button><button ref={confirmRef} type='button' onClick={e => { stop(e); onDelete?.(e); closeOptions() }}>Delete</button></div>
            </Confirmation> : null}
            {confirmDelete && list ? createPortal(
                <ConfirmationBackdrop onClick={e => { stop(e); closeOptions() }}>
                    <Confirmation $list role='alertdialog' aria-modal='true' aria-label={`Delete ${title}?`} onClick={stop} onKeyDown={onDialogKey}>
                        <strong>Delete this route?</strong><p>{title}</p><p>This removes the route from your library. A downloaded route also has its downloaded video removed.</p>
                        <div><button ref={cancelRef} type='button' onClick={closeOptions}>Cancel</button><button ref={confirmRef} type='button' onClick={e => { stop(e); onDelete?.(e); closeOptions() }}>Delete</button></div>
                    </Confirmation>
                </ConfirmationBackdrop>, document.body) : null}
        </Surface>
    </ErrorBoundary>
}
