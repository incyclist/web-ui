import React, { useEffect, useState } from 'react'
import { ArrowRightIcon, TrashIcon } from '@primer/octicons-react'
import { formatDateTime, useActivityList, useAppsService, useUserSettings } from 'incyclist-services'
import { AppThemeProvider } from '../../../../theme'
import { ActivityPreview } from '../ActivityPreview'
import { Actions, Chart, Container, DateTime, DeleteButton, Identity, OpenButton, Profile,
    Skeleton, Stats, StatusRow, Title, UploadStatus } from './atoms'

const finite = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
const formatMetric = (value, divisor, unit, digits) => {
    if (value?.value != null && value.unit) return `${value.value} ${value.unit}`
    return finite(value) ? `${(Number(value) / divisor).toFixed(digits)} ${unit}` : '—'
}
const formatDuration = seconds => {
    if (!finite(seconds)) return '—'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours ? `${hours}h ${minutes}min` : `${minutes}min`
}

export const ActivityListItem = ({ onClick, onDelete, activityInfo, outsideFold }) => {
    const service = useActivityList()
    const apps = useAppsService()
    const settings = useUserSettings()
    const { summary, details: suppliedDetails } = activityInfo ?? {}
    const id = summary?.id
    const [loaded, setLoaded] = useState(null)
    const details = loaded?.id === id ? { ...suppliedDetails, ...loaded.details } : suppliedDetails
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        if (outsideFold || id === undefined || suppliedDetails?.logs || loaded?.id === id) return
        setFailed(false)
        let active = true
        let observer
        const onLoaded = next => { if (active) setLoaded({ id, details: next }) }
        const onError = () => { if (active) setFailed(true) }
        try {
            observer = service.getActivityDetails(id)
            observer?.on('loaded', onLoaded)
            observer?.on('updated', onLoaded)
            observer?.on('load-error', onError)
        } catch { onError() }
        return () => {
            active = false
            observer?.off('loaded', onLoaded)
            observer?.off('updated', onLoaded)
            observer?.off('load-error', onError)
        }
    }, [outsideFold, id, suppliedDetails?.logs, service, loaded])

    if (outsideFold) return <AppThemeProvider><Skeleton data-testid='activity-list-item-skeleton' aria-hidden='true' /></AppThemeProvider>
    if (!summary) return null

    const title = summary.title || 'Untitled activity'
    const start = summary.startTime != null ? new Date(summary.startTime) : null
    const validStart = start && !Number.isNaN(start.getTime())
    const dateTime = validStart ? `${formatDateTime(start, '%d.%m.%Y')} · ${formatDateTime(start, '%H:%M')}` : 'Date unavailable'
    const uploads = (summary.uploadStatus ?? []).filter(upload => upload.service && ['success', 'failure'].includes(upload.status))
    let ftp = 200
    try { ftp = settings.get('user')?.ftp ?? 200 } catch {}
    const hasPower = details?.logs?.some(log => log && finite(log.power) && finite(log.time))
    const loading = !details?.logs && !failed && loaded?.id !== id
    const open = () => onClick?.(id)

    return <AppThemeProvider>
        <Container aria-label={`Activity ${title}`} tabIndex={0} onClick={open}
            onKeyDown={event => {
                if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) {
                    event.preventDefault()
                    open()
                }
            }}>
            <Identity>
                <Title title={title}>{title}</Title>
                <DateTime dateTime={validStart ? start.toISOString() : undefined}>{dateTime}</DateTime>
                {uploads.length ? <StatusRow aria-label='Upload status'>
                    {uploads.map(upload => {
                        let name = upload.service
                        try { name = apps.getName(upload.service) } catch {}
                        const label = `${name} · ${upload.status === 'success' ? 'Uploaded' : 'Upload failed'}`
                        return <UploadStatus key={upload.service} $success={upload.status === 'success'} title={label}>{label}</UploadStatus>
                    })}
                </StatusRow> : null}
            </Identity>
            <Stats>
                <div><strong>{formatDuration(summary.rideTime)}</strong><small>Duration</small></div>
                <div><strong>{formatMetric(summary.distance, 1000, 'km', 1)}</strong><small>Distance</small></div>
                <div><strong>{formatMetric(summary.totalElevation ?? details?.totalElevation, 1, 'm', 0)}</strong><small>Total ascent</small></div>
            </Stats>
            <Profile>
                {hasPower ? <>
                    <Chart role='img' aria-label={`Power profile for ${title}`}>
                        <ActivityPreview activity={details} ftp={ftp} />
                    </Chart>
                    <small>Power profile</small>
                </> : <small role='status'>{loading ? 'Loading power profile…' : 'Power profile unavailable'}</small>}
            </Profile>
            <Actions>
                {onClick ? <OpenButton responsive shape='rounded' primary no3D type='button'
                    logContext={{ activity: title }} aria-label={`View details for ${title}`}
                    onClick={event => { event.stopPropagation(); open() }}>
                    Details<ArrowRightIcon size={16} />
                </OpenButton> : null}
                {onDelete ? <DeleteButton type='button' aria-label={`Delete ${title}`}
                    onClick={event => { event.stopPropagation(); onDelete() }}><TrashIcon size={17} /></DeleteButton> : null}
            </Actions>
        </Container>
    </AppThemeProvider>
}
