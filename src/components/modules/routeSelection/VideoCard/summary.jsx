import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import Flag from 'react-world-flags'
import { KebabHorizontalIcon, ArrowRightIcon, TrashIcon, PeopleIcon, PlayIcon } from '@primer/octicons-react'
import { useRouteList } from 'incyclist-services'
import { FreeMap } from '../../../molecules/Maps'
import { ErrorBoundary, Loader } from '../../../atoms'
import { CardSkeleton } from '../base/skeleton'

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
    width: 100%; height: 100%; min-height: 480px; overflow: hidden; border-radius: 12px;
    background: #171321; border: 1px solid #3a3248; color: #f7f5fa; text-align: left;
    font-family: inherit; cursor: pointer; isolation: isolate;
    &:hover, &:focus-within { border-color: #cba15c; }
    &:focus-visible { outline: 3px solid #efc580; outline-offset: -3px; }
    button { font-family: inherit; cursor: pointer; }
    button:focus-visible { outline: 3px solid #efc580; outline-offset: 2px; }
    button:disabled { cursor: default; opacity: .5; }
`
const Preview = styled.div`
    position: relative; width: 100%; aspect-ratio: 16 / 9; flex-shrink: 0;
    overflow: hidden; background: #252330;
    > img { display: block; width: 100%; height: 100%; object-fit: cover; }
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
    width: 40px; height: 40px; border: 1px solid #5c506a; border-radius: 8px;
    background: #272031; color: #ede8f4;
    &:hover { background: #3b3048; }
`
const Body = styled.div`
    display: flex; flex: 1; flex-direction: column; padding: 14px; gap: 12px; min-height: 0;
`
const Heading = styled.h3`
    font-size: 18px; line-height: 1.25; font-weight: 650; margin: 0; min-height: 45px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; overflow-wrap: anywhere;
`
const Location = styled.div`
    display: flex; gap: 7px; align-items: center; color: #bfb6ce; font-size: 12px; min-height: 20px;
    img { border-radius: 2px; max-width: 22px; }
`
const Stats = styled.div`
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    strong { display: block; font-size: 23px; font-weight: 650; letter-spacing: -.5px; }
    small { display: block; margin-top: 3px; font-size: 11px; color: #bfb6ce; }
`
const Profile = styled.div`
    height: 48px; flex-shrink: 0;
    svg { display: block; width: 100%; height: 32px; overflow: visible; }
    small { color: #a99db9; display: block; font-size: 10px; margin-top: 3px; }
`
const StatusRow = styled.div`
    display: flex; align-items: center; gap: 6px; min-height: 22px; flex-wrap: wrap;
    font-size: 11px; color: #beb5cc;
`
const Badge = styled.span`
    display: inline-flex; align-items: center; gap: 4px; padding: 4px 7px; border-radius: 5px;
    color: ${p => p.$live ? '#a5e1bf' : '#efd09b'};
    background: ${p => p.$live ? '#203a32' : '#3a3028'}; font-weight: 600;
`
const Actions = styled.div`
    display: flex; gap: 8px; margin-top: auto; padding-top: 2px;
`
const OpenButton = styled.button`
    display: flex; align-items: center; justify-content: center; gap: 10px;
    height: 40px; flex: 1; border-radius: 7px; border: 1px solid #987549;
    color: #f6d498; background: #352a25; font-size: 13px; font-weight: 650;
    &:hover { background: #4b3928; border-color: #dfb478; }
`
const Panel = styled.div`
    position: absolute; z-index: 1100; inset: auto 10px 60px; padding: 14px;
    background: #272031; border: 1px solid #70617e; border-radius: 10px;
    box-shadow: 0 8px 30px #0008; cursor: default; font-size: 12px; line-height: 1.5;
    p { margin: 0 0 12px; color: #d0c6dd; }
    button { width: 100%; min-height: 40px; border: 1px solid #6b5e7a; border-radius: 6px;
        background: #393043; color: white; text-align: left; padding: 8px; }
`
const Confirmation = styled(Panel)`
    inset: 0; display: flex; flex-direction: column; justify-content: center; border-radius: 11px;
    background: #211a2d; padding: 20px;
    strong { font-size: 18px; margin-bottom: 12px; }
    div { display: flex; gap: 8px; }
    button { text-align: center; }
    button:last-child { background: #9b3443; }
`

export const RouteProfile = ({ points }) => {
    const id = useId().replace(/:/g, '')
    const data = profilePoints(points)
    if (data.length < 2) return <Profile><small>Elevation profile unavailable</small></Profile>
    const minX = data[0].routeDistance, maxX = data[data.length - 1].routeDistance
    const { min, max } = data.reduce((bounds, p) => ({ min: Math.min(bounds.min, Number(p.elevation)), max: Math.max(bounds.max, Number(p.elevation)) }), { min: Infinity, max: -Infinity })
    // Keep a minimum 100 m scale so minor undulations do not look like major climbs.
    const range = Math.max(100, max - min)
    const stride = Math.max(1, Math.ceil(data.length / 250))
    const line = data.filter((p, i) => i % stride === 0 || i === data.length - 1).map(p => `${((p.routeDistance - minX) / (maxX - minX || 1) * 250).toFixed(2)},${(30 - (p.elevation - min) / range * 28).toFixed(2)}`).join(' ')
    return <Profile aria-label={`Elevation profile, ${Math.round(min)} to ${Math.round(max)} metres`}>
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

export const VideoSummary = (props) => {
    const { id, title = 'Untitled route', country, distance, elevation, totalDistance, totalElevation,
        previewUrl, videoUrl, visible, hasVideo, isDemo, isNew, cntActive, videoPill,
        shape, canDelete = false, buttonText = 'View details', onClick, onOK, onDelete } = props
    const service = useRouteList()
    const [details, setDetails] = useState({})
    const [imageFailed, setImageFailed] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const menuRef = useRef(null)
    const optionsRef = useRef(null)
    const cancelRef = useRef(null)
    const confirmRef = useRef(null)
    const menuId = useId()
    const hasShape = Array.isArray(shape) && shape.length > 0

    useEffect(() => {
        setDetails({})
        if (hasShape || props.loaded || !visible) return
        setDetails({ loading: true })
        let active = true
        const cancel = service.requestRouteDetails(id, data => {
            if (active) setDetails({ loading: false, points: data?.points })
        })
        return () => { active = false; cancel?.() }
    }, [id, hasShape, props.loaded, service, visible])
    useEffect(() => { setImageFailed(false) }, [previewUrl, id])
    useEffect(() => {
        if (confirmDelete) cancelRef.current?.focus()
        else if (menuOpen) menuRef.current?.focus()
    }, [menuOpen, confirmDelete])

    const points = hasShape ? shape : (details.points ?? props.points ?? [])
    const coordinates = useMemo(() => validCoordinates(points), [points])
    const isVideo = hasVideo ?? Boolean(videoUrl || previewUrl)
    const renderImage = isVideo && previewUrl && !imageFailed
    const renderMap = !renderImage && coordinates.length >= 2
    const location = countryLabel(country)
    const closeOptions = () => { setMenuOpen(false); setConfirmDelete(false); optionsRef.current?.focus() }
    const open = e => {
        if (confirmDelete || menuOpen) return
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
        <Surface className='route-summary' aria-label={`Route ${title}`} tabIndex={0} onClick={open}
            onKeyDown={e => { if (e.target === e.currentTarget && ['Enter', ' '].includes(e.key)) { e.preventDefault(); open(e) } }}>
            <Preview inert={confirmDelete}>
                {renderImage ? <img src={previewUrl} alt={title} onError={() => setImageFailed(true)} draggable={false} /> :
                    renderMap ? <MapPreview><FreeMap noAttribution scrollWheelZoom={false} zoomControl={false} points={coordinates} startPos={0} draggable={false} /></MapPreview> :
                        <Placeholder>{details.loading ? <Loader size={26} /> : <><img src='images/route.svg' alt='' width='28' height='28' /><span>{isVideo ? 'Video Route' : 'Map unavailable'}</span></>}</Placeholder>}
                <MediaBadge>{isVideo ? <><PlayIcon size={12} /> VIDEO</> : 'GPX'}</MediaBadge>
            </Preview>
            <Body inert={confirmDelete}>
                <div><Heading title={title}>{title}</Heading><Location>{location ? <><Flag code={location.code} height='13' alt='' />{location.name}</> : 'Location unavailable'}</Location></div>
                <Stats>
                    <div><strong>{formatMetric(totalDistance, distance, 1000, 'km', 1)}</strong><small>Distance</small></div>
                    <div><strong>{formatMetric(totalElevation, elevation, 1, 'm', 0)}</strong><small>Total ascent</small></div>
                </Stats>
                <RouteProfile points={points} />
                <StatusRow>
                    {isNew ? <Badge>New</Badge> : null}{isDemo ? <Badge>Demo</Badge> : null}
                    {videoPillLabels[videoPill] ? <Badge>{videoPillLabels[videoPill]}</Badge> : null}
                    {cntActive > 0 ? <Badge $live style={{ marginLeft: 'auto' }}><PeopleIcon size={12} />{cntActive} live</Badge> : null}
                </StatusRow>
                <Actions>
                    {onOK || onClick ? <OpenButton type='button' onClick={e => { stop(e); open(e) }} aria-label={`View details for ${title}`}>{buttonText}<ArrowRightIcon size={16} /></OpenButton> : null}
                    {canDelete && onDelete ? <IconButton ref={optionsRef} type='button' aria-label={`Options for ${title}`} aria-expanded={menuOpen} aria-controls={menuId}
                        onClick={e => { stop(e); setMenuOpen(v => !v) }}><KebabHorizontalIcon size={19} /></IconButton>
                    : null}
                </Actions>
            </Body>
            {menuOpen && !confirmDelete ? <Panel ref={menuRef} id={menuId} tabIndex={-1} role='region' aria-label={`Options for ${title}`}
                onClick={stop} onKeyDown={onDialogKey}
                onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget) && e.relatedTarget !== optionsRef.current) setMenuOpen(false) }}>
                {canDelete && onDelete ? <button type='button' aria-label={`Delete ${title}`} onClick={() => setConfirmDelete(true)}><TrashIcon size={14} /> Delete route…</button> : null}
                <button type='button' style={{ marginTop: 8 }} onClick={closeOptions}>Close</button>
            </Panel> : null}
            {confirmDelete ? <Confirmation role='alertdialog' aria-modal='true' aria-label={`Delete ${title}?`} onClick={stop} onKeyDown={onDialogKey}>
                <strong>Delete this route?</strong><p>{title}</p><p>This removes the route from your library. A downloaded route also has its downloaded video removed.</p>
                <div><button ref={cancelRef} type='button' onClick={closeOptions}>Cancel</button><button ref={confirmRef} type='button' onClick={e => { stop(e); onDelete?.(e); closeOptions() }}>Delete</button></div>
            </Confirmation> : null}
        </Surface>
    </ErrorBoundary>
}
