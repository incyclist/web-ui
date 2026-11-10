import React from 'react'
import { ActivityListItemView } from './ActivityListItemView'
import ActivityLarge from '../../../../__tests__/testdata/ActivityLarge.json'

export default {
    component: ActivityListItemView,
    title: 'Molecules/Activities/ActivityListItem',
    argTypes: { onOpen: { action: 'open' }, onDelete: { action: 'delete' } }
}

const Template = args => <ActivityListItemView {...args} />
const activity = structuredClone(ActivityLarge)
const display = {
    id: 'preview', title: 'Morning ride · Passo Pordoi', dateTime: '18.10.2026 · 07:30',
    dateTimeISO: '2026-10-18T10:30:00Z', duration: '1h 5min', distance: '32.5 km', ascent: '772 m', activity, ftp: 240,
    uploads: [{ service: 'strava', name: 'Strava', status: 'success' }, { service: 'intervals', name: 'Intervals.icu', status: 'success' }]
}

export const Default = Template.bind({})
Default.args = display

export const Imperial = Template.bind({})
Imperial.args = { ...display, distance: '20.2 mi', ascent: '2533 ft' }

export const WithTitle = Template.bind({})
WithTitle.args = { ...display, title: 'My Activity' }

export const NoLogs = Template.bind({})
NoLogs.args = { ...display, activity: undefined }

export const Loading = Template.bind({})
Loading.args = { ...display, activity: undefined, loading: true }

export const NoActivity = Template.bind({})
NoActivity.args = {}

export const NotVisible = Template.bind({})
NotVisible.args = { outsideFold: true }
