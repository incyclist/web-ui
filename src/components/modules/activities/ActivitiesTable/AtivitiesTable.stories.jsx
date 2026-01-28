import React from 'react';
import {ActivitiesTable} from '.';
import ActivitySmall from '../../../../__tests__/testdata/activity.json'
import ActivityLarge from '../../../../__tests__/testdata/ActivityLarge.json'
import DB from '../../../../__tests__/testdata/activity-db.json'
import styled from 'styled-components';
import { Row } from '../../../atoms';
import { useActivityList } from 'incyclist-services';


const View = styled(Row)`   
    width: 800px;
    height: 600px;
    overflow-y: hidden;
`;


export default {
    component: ActivitiesTable,
    title: 'Modules/Activities/ActivitiesTable',    
    argTypes: { 
        onSelect: { action: 'select' } ,
        onDelete: { action: 'delete' } 
    },

  };

const svc = useActivityList()

const Template = args => <View className='TEST'> <ActivitiesTable {...args} /></View>
const activities = DB.activities.map( a=> ( {summary:a,id:a.id}))



const largeIdx = DB.activities.findIndex( a=> a.id===ActivityLarge.id)
if (largeIdx>0)
    activities[largeIdx].details = ActivityLarge

const smallIdx = DB.activities.findIndex( a=> a.id===ActivitySmall.id)
if (smallIdx>0)
    activities[largeIdx].details = ActivitySmall

export const Default = Template.bind({});
Default.args = {    
    activities
}


export const Start= Template.bind({});
Start.args = {    
    activities,
    start:10
}
