import React from 'react';

import {ActivityDetails} from './ActivityDetails';


//const routeData = route.decoded
import activity from '../../../../__tests__/testdata/ActivityLarge.json'

export default {
  component: ActivityDetails,
  title: 'Modules/Activities/ActivityDetails',
  argTypes: { 
    onStart: { action: 'start' } , 
    onCancel: { action: 'cancel' },
    onDelete: { action: 'delete' }, 
    onExport: { action: 'export' }, 
    onUpload: { action: 'upload' },  
    onOpenUpload: { action: 'open upload' },
    onOpenExport: { action: 'open export' }
  }
};

const Template = args => <ActivityDetails {...args} />;


export const Default = Template.bind({});
Default.args = {
    title:'My Activity',
    distance: activity.distance,
    duration: activity.time,
    elevation: activity.totalElevation??120,
    started: new Date(activity.startTime),
    showMap: true,
    points:activity.logs.map( p => ({lat:p.lat,lng:p.lon}) ),
    activity, 
    stats: activity.stats,
    exports: [
        { type: 'fit', file: '/tmp/test.fit' },
        { type: 'tcx' },
        { type: 'json', url: '/tmp/test.tcx' }
    ],
    uploads: [
        { type: 'Strava', url: 'https://www.strava.com/activities/12913907723', status:'success' },
        { type: 'VeloHero' },
        { type: 'Intervals.icu', status:'failed' },
        
    ],

};
