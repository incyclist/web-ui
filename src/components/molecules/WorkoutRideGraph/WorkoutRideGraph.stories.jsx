import React from 'react';
import { Segment, Workout } from 'incyclist-services';

import {WorkoutRideGraph} from './WorkoutRideGraph';
import Activity from '../../../__tests__/testdata/activity.json'
import ActivityLarge from '../../../__tests__/testdata/ActivityLarge.json'
import { clone } from '../../../utils';
import { Row } from '../../atoms';

export default {
    component: WorkoutRideGraph,
    title: 'Molecules/Activities/WorkoutRideGraph',    
  };

const wo = new Workout({name:'Test Workout'});

const s = new Segment( {  repeat: 3,
    steps: [
        { duration: 20, power:{min:80, max:100,type:'pct of FTP'}, steady:true, work:true } ,
        { duration: 20, power:{min:100, max:120,type:'pct of FTP'}, steady:true, work:true } ,
        { duration: 20, power:{min:120, max:140,type:'pct of FTP'}, steady:true, work:true } 
    ]
})
wo.addSegment( s)


const Template = args => <WorkoutRideGraph {...args} />


export const Default = Template.bind({});
Default.args = {
    ftp: 200,
    activity: ActivityLarge,
    workout: wo
}

export const Short = Template.bind({});
Short.args = {
    ftp: 200,
    activity: Activity,
    workout: wo
}

export const WidthAndHeight = Template.bind({});
WidthAndHeight.args = {
    ftp: 200,
    activity: ActivityLarge,
    width: '20vw',
    height: '20vh',
    workout: wo


}

export const Loading = Template.bind({});
Loading.args = {
    ftp: 200,
    loading: true
}


const TemplateDiv = args => <Row width='10vw' background='grey' height='10vh'><WorkoutRideGraph {...args} /></Row>
export const Div = TemplateDiv.bind({});
Div.args = {
    ftp: 200,
    activity: ActivityLarge,
    workout: wo

}

const NoFTPActivity = ActivityLarge
delete NoFTPActivity.user.ftp
export const NoFTP = Template.bind({});
NoFTP.args = {
    activity: NoFTPActivity,
    workout: wo

}



const NoHrmActivity = clone(ActivityLarge)
NoHrmActivity.logs.forEach( l => { delete l.heartrate})
export const NoHrm = Template.bind({});
NoHrm.args = {
    ftp: 200,
    activity: NoHrmActivity,
    workout: wo

}

