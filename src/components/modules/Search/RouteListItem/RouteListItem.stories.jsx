import React from 'react'
import { RouteListItemView } from './component'

export default { title: 'Components/Modules/Search/RouteListItem', component: RouteListItemView }

const points = [
    { lat: 48.3, lng: 10.3, routeDistance: 0, elevation: 209 },
    { lat: 48.35, lng: 10.35, routeDistance: 11700, elevation: 336 },
]

export const Video = {
    args: {
        id: 'arnbach', title: 'Arnbach', country: 'DE', hasVideo: true, ready: true,
        previewUrl: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
        shape: points, totalDistance: { value: 11.7, unit: 'km' }, totalElevation: { value: 202, unit: 'm' },
        isNew: true, cntActive: 12, canDelete: true, onOK: () => {}, onDelete: () => {},
    },
}

export const GPX = {
    args: {
        ...Video.args, id: 'gpx', title: 'Mountain GPX Route', hasVideo: false,
        previewUrl: undefined, isNew: false, canDelete: false,
    },
}
