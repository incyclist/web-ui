import React   from 'react';
import { MemoryRouter } from 'react-router';
import { ActivitiesScreen } from './ActivitiesPage';

import DB from '../../__tests__/testdata/activity-db.json'
import ActivityLarge from '../../__tests__/testdata/ActivityLarge.json'

const activities = DB.activities.map( a=> ( {summary:a}))

const largeIdx = DB.activities.findIndex( a=> a.id===ActivityLarge.id)
if (largeIdx>0)
    activities[largeIdx].details = ActivityLarge


export default {
    component: ActivitiesScreen,
    title: 'Pages/Activities',   
    decorators: [Story => <MemoryRouter><Story /></MemoryRouter>],
    argTypes: { 
        onSelect: {action: 'selected'},
        onDelete: {action: 'deleted'},
    },
  };

  

const Template = args => <ActivitiesScreen {...args} width={800} height={600}  />

export const Default = Template.bind({});
Default.args = 
{
    activities
}

export const RedesignedList = Template.bind({});
RedesignedList.args = {
    activities: [
        { title: 'Morning ride · Passo Pordoi', distance: { value: 32.5, unit: 'km' }, totalElevation: { value: 772, unit: 'm' },
            uploadStatus: [{ service: 'strava', status: 'success' }, { service: 'intervals', status: 'success' }] },
        { title: 'Evening recovery', distance: { value: 18.2, unit: 'km' }, totalElevation: { value: 0, unit: 'm' },
            uploadStatus: [{ service: 'strava', status: 'failure' }] },
        { title: 'A longer activity title exploring the mountain roads and climbs around the valley',
            distance: { value: 46.7, unit: 'km' }, totalElevation: { value: 1250, unit: 'm' } },
        { title: 'Lunch ride', distance: { value: 12.4, unit: 'km' }, totalElevation: { value: 95, unit: 'm' } }
    ].map((summary, index) => ({
        summary: { ...summary, id: `preview-${index}`, startTime: new Date('2026-10-18T10:30:00Z').getTime() - index * 86400000,
            rideTime: 3900 + index * 600 },
        details: ActivityLarge
    }))
}

export const Loading = Template.bind({});
Loading.args = { loading: true }

export const Empty = Template.bind({});
Empty.args = { activities: [] }

