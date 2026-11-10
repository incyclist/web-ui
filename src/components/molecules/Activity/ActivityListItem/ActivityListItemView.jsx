import React from 'react'
import { ArrowRightIcon, TrashIcon } from '@primer/octicons-react'
import { AppThemeProvider } from '../../../../theme'
import { ActivityPreview } from '../ActivityPreview'
import { Actions, Chart, Container, DateTime, DeleteButton, Identity, OpenButton, Profile,
    Skeleton, Stats, StatusRow, Title, UploadStatus } from './atoms'

export const ActivityListItemView = ({ id, title, dateTime, dateTimeISO, duration = '—', distance = '—', ascent = '—',
    uploads = [], activity, ftp, loading, outsideFold, onOpen, onDelete }) => {
    if (outsideFold) return <AppThemeProvider><Skeleton data-testid='activity-list-item-skeleton' aria-hidden='true' /></AppThemeProvider>
    if (!title) return null

    return <AppThemeProvider>
        <Container aria-label={`Activity ${title}`} tabIndex={onOpen ? 0 : undefined}
            onClick={onOpen ? () => onOpen('card') : undefined}
            onKeyDown={event => {
                if (onOpen && event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) {
                    event.preventDefault()
                    onOpen('keyboard', event.key)
                }
            }}>
            <Identity>
                <Title title={title}>{title}</Title>
                <DateTime dateTime={dateTimeISO}>{dateTime}</DateTime>
                {uploads.length ? <StatusRow aria-label='Upload status'>
                    {uploads.map(upload => {
                        const label = `${upload.name} · ${upload.status === 'success' ? 'Uploaded' : 'Upload failed'}`
                        return <UploadStatus key={upload.service} $success={upload.status === 'success'} title={label}>{label}</UploadStatus>
                    })}
                </StatusRow> : null}
            </Identity>
            <Stats>
                <div><strong>{duration}</strong><small>Duration</small></div>
                <div><strong>{distance}</strong><small>Distance</small></div>
                <div><strong>{ascent}</strong><small>Total ascent</small></div>
            </Stats>
            <Profile>
                {activity ? <>
                    <Chart role='img' aria-label={`Power profile for ${title}`}>
                        <ActivityPreview activity={activity} ftp={ftp} />
                    </Chart>
                    <small>Power profile</small>
                </> : <small role='status'>{loading ? 'Loading power profile…' : 'Power profile unavailable'}</small>}
            </Profile>
            <Actions>
                {onOpen ? <OpenButton responsive shape='rounded' primary no3D type='button' text='Details'
                    logContext={{ activityId: id }} aria-label={`View details for ${title}`}
                    onClick={() => onOpen('details')}><ArrowRightIcon size={16} /></OpenButton> : null}
                {onDelete ? <DeleteButton responsive shape='rounded' secondary no3D type='button'
                    aria-label={`Delete ${title}`} logContext={{ button: 'delete', activityId: id }}
                    onClick={onDelete}><TrashIcon size={17} /></DeleteButton> : null}
            </Actions>
        </Container>
    </AppThemeProvider>
}
