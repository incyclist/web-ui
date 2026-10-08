import React from 'react'
import { RouteTileSummaryView } from './component'

export default { title: 'Components/Modules/Search/RouteTileSummary', component: RouteTileSummaryView }

const Template = args => <div style={{ width: 280, height: 388 }}><RouteTileSummaryView {...args} /></div>

export const Video = Template.bind({})
Video.args = {
    id: 'video-example', title: 'Arnbach', country: 'DE', visible: true, loaded: true,
    hasVideo: true, previewUrl: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
    totalDistance: { value: 13, unit: 'km' }, totalElevation: { value: 772, unit: 'm' },
    isNew: true, cntActive: 12, onOK: () => {}
}

export const GPX = Template.bind({})
GPX.args = {
    id: 'gpx-example', title: 'Sydney Harbor Loop', country: 'AU', visible: true, loaded: true,
    hasVideo: false, totalDistance: { value: 24.5, unit: 'km' }, totalElevation: { value: 340, unit: 'm' },
    shape: [
        { lat: -33.86, lng: 151.2, routeDistance: 0, elevation: 5 },
        { lat: -33.85, lng: 151.21, routeDistance: 1000, elevation: 22 },
        { lat: -33.84, lng: 151.22, routeDistance: 2000, elevation: 10 }
    ],
    onOK: () => {}
}

export const OutsideFold = Template.bind({})
OutsideFold.args = { ...GPX.args, visible: false, width: 280, height: 388 }
