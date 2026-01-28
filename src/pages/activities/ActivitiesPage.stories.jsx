import React   from 'react';
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

