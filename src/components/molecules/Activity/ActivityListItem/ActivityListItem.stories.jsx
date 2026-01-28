import React, { act } from 'react';
import {ActivityListItem} from './ActivityListItem';
import Activity from '../../../../__tests__/testdata/activity.json'
import ActivityLarge from '../../../../__tests__/testdata/ActivityLarge.json'
import DB from '../../../../__tests__/testdata/activity-db.json'

export default {
    component: ActivityListItem,
    title: 'Molecules/Activities/ActivityListItem',    
    argTypes: { 
        onClick: { action: 'click' } ,
        onDelete: { action: 'delete' } 
    },
  };
const Template = args => <ActivityListItem {...args} />

const {activities} = DB

const summaryLarge = activities.find( a=> a.id===ActivityLarge.id)


export const Default = Template.bind({});
Default.args = {    
    activityInfo: {
        summary: summaryLarge, 
        details: { ...structuredClone(ActivityLarge) }
    }

}

export const Imperial = Template.bind({});
Imperial.args = {    
    activityInfo: {
        summary: { ...summaryLarge, 
            distance:{value:'30.2',unit:'mi'},
            totalElevation:{value:'200',unit:'ft'} 
        },
        details: { ...structuredClone(ActivityLarge),
            distance:{value:'30.2',unit:'mi'},
            totalElevation:{value:'200',unit:'ft'} 
        }
    }

}

export const WithTitle = Template.bind({});
WithTitle.args = {    
    activityInfo: {
        summary:{...summaryLarge, title:'My Activity'},
        details: { ...structuredClone(ActivityLarge) }
    }

}

const activityWithRouteTitle = structuredClone(ActivityLarge)
activityWithRouteTitle.route.title = 'My Route'
export const WithRouteTitle = Template.bind({});
WithRouteTitle.args = {    
    activityInfo: { 
        summary: summaryLarge,
        details: activityWithRouteTitle
    }

}

export const NoLogs = Template.bind({});
NoLogs.args = {
    activityInfo: {
        summery: activities[0]
    }
}

export const NoActivity = Template.bind({});
NoActivity.args = {

}


export const NotVisible = Template.bind({});
NotVisible.args = {    
    outsideFold:true,
    activityInfo: { 
        summary: summaryLarge,
        details: { ...structuredClone(ActivityLarge) }
    }

}
