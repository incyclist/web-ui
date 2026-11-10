import React, { useEffect, useState } from 'react'
import { EventLogger } from 'gd-eventlog'
import { formatDateTime, useActivityList, useAppsService, useUnitConverter, useUserSettings } from 'incyclist-services'
import { ErrorBoundary } from '../../../atoms'
import { ActivityListItemView } from './ActivityListItemView'

const DETAILS_TIMEOUT_MS = 10000
const finite = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
const formatDuration = seconds => {
    if (!finite(seconds)) return '—'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours ? `${hours}h ${minutes}min` : `${minutes}min`
}

const ActivityListItemContent = ({ onClick, onDelete, activityInfo, outsideFold }) => {
    const service = useActivityList()
    const apps = useAppsService()
    const settings = useUserSettings()
    const converter = useUnitConverter()
    const [logger] = useState(() => new EventLogger('ActivityListItem'))
    const { summary, details: suppliedDetails } = activityInfo ?? {}
    const id = summary?.id
    const [loaded, setLoaded] = useState(null)
    const [failedId, setFailedId] = useState(null)
    const details = loaded?.id === id ? { ...suppliedDetails, ...loaded?.details } : suppliedDetails
    const suppliedLogs = suppliedDetails?.logs
    const loadedId = loaded?.id

    useEffect(() => {
        if (outsideFold || id == null || Array.isArray(suppliedLogs) || loadedId === id) return
        setFailedId(null)
        let active = true
        let observer
        const timeout = setTimeout(() => {
            if (active) {
                setFailedId(id)
                logger.logEvent({ message: 'activity details timed out', activityId: id })
            }
        }, DETAILS_TIMEOUT_MS)
        const onLoaded = next => {
            if (!active) return
            clearTimeout(timeout)
            setLoaded({ id, details: next })
        }
        const onError = () => {
            if (!active) return
            clearTimeout(timeout)
            setFailedId(id)
        }
        try {
            observer = service.getActivityDetails(id)
            if (!observer?.on) onError()
            else {
                observer.on('loaded', onLoaded)
                observer.on('updated', onLoaded)
                observer.on('load-error', onError)
            }
        } catch { onError() }
        return () => {
            active = false
            clearTimeout(timeout)
            observer?.off?.('loaded', onLoaded)
            observer?.off?.('updated', onLoaded)
            observer?.off?.('load-error', onError)
        }
    }, [outsideFold, id, suppliedLogs, service, loadedId, logger])

    if (outsideFold) return <ActivityListItemView outsideFold />
    if (!summary) return null

    const formatMetric = (value, dimension, digits) => {
        if (value?.value != null && value.unit) return `${value.value} ${value.unit}`
        if (!finite(value)) return '—'
        const converted = converter.convert(Number(value), dimension, { digits })
        const unit = converter.getUnit(dimension)
        return finite(converted) && unit ? `${Number(converted).toFixed(digits)} ${unit}` : '—'
    }
    const start = summary.startTime != null ? new Date(summary.startTime) : null
    const validStart = start && !Number.isNaN(start.getTime())
    const dateTime = validStart ? `${formatDateTime(start, '%d.%m.%Y')} · ${formatDateTime(start, '%H:%M')}` : 'Date unavailable'
    const uploads = (Array.isArray(summary.uploadStatus) ? summary.uploadStatus : [])
        .filter(upload => upload?.service && ['success', 'failure'].includes(upload.status))
        .map(upload => {
            let name = upload.service
            try { name = apps.getName(upload.service) } catch {}
            return { ...upload, name }
        })
    let ftp = 200
    try { ftp = settings.get('user')?.ftp ?? 200 } catch {}
    const logs = Array.isArray(details?.logs) ? details.logs.filter(log => log && finite(log.time) && finite(log.power)) : []
    const activity = logs.length ? { ...details, logs } : undefined
    const loading = id != null && !Array.isArray(suppliedLogs) && loadedId !== id && failedId !== id

    const onOpen = (source, key) => {
        if (source === 'card') logger.logEvent({ message: 'tile clicked', activityId: id, eventSource: 'user' })
        if (source === 'keyboard') logger.logEvent({ message: 'key pressed', key, activityId: id, eventSource: 'user' })
        onClick?.(id)
    }

    return <ActivityListItemView
        id={id} title={summary.title || 'Untitled activity'} dateTime={dateTime}
        dateTimeISO={validStart ? start.toISOString() : undefined}
        duration={formatDuration(summary.rideTime)} distance={formatMetric(summary.distance ?? details?.distance, 'distance', 1)}
        ascent={formatMetric(summary.totalElevation ?? details?.totalElevation, 'elevation', 0)}
        uploads={uploads} activity={activity} ftp={ftp} loading={loading}
        onOpen={onClick ? onOpen : undefined} onDelete={onDelete} />
}

export const ActivityListItem = props => <ErrorBoundary key={props.activityInfo?.summary?.id} hideOnError>
    <ActivityListItemContent {...props} />
</ErrorBoundary>
