import React from 'react'
import { RouteListDetailsHeader } from './index'

export default { title: 'Components/Molecules/RouteListDetailsHeader', component: RouteListDetailsHeader }

export const VideoRoute = {
    args: {
        route: { description: { title: 'Passo Pordoi', country: 'IT', hasVideo: true, distance: 13000, elevation: 772 } },
        totalDistance: { value: 13, unit: 'km' }, totalElevation: { value: 772, unit: 'm' },
        routeType: 'Video - Point to Point', isNew: true, cntActive: 12,
    },
}
