import React from 'react'
import { RouteTilesView } from './component'
import { RouteTileSummaryView } from '../RouteTileSummary/component'

export default { title: 'Components/Modules/Search/RouteTiles', component: RouteTilesView }

const DemoTile = props => <RouteTileSummaryView {...props} />

export const Grid = {
    args: {
        tiles: [
            { id: 'video', props: { id: 'video', title: 'Passo Pordoi', country: 'IT', visible: true,
                hasVideo: true, isNew: true, cntActive: 12, totalDistance: { value: 13, unit: 'km' },
                totalElevation: { value: 772, unit: 'm' }, onOK: () => {} } },
            { id: 'gpx', props: { id: 'gpx', title: 'Sydney Harbor Loop', country: 'AU', visible: true,
                totalDistance: { value: 24.5, unit: 'km' }, totalElevation: { value: 340, unit: 'm' },
                shape: [{lat:-33.86,lng:151.2,routeDistance:0,elevation:5}, {lat:-33.85,lng:151.21,routeDistance:1000,elevation:22}],
                onOK: () => {} } },
        ],
        initialized: true, isOutsideFold: () => false, getFoldEvent: id => `outsideFold-${id}`,
        TileComponent: DemoTile,
    },
}
