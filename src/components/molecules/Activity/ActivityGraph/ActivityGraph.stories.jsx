import React from 'react';
import {ActivityGraph} from './ActivityGraph';
import Activity from '../../../../__tests__/testdata/activity.json'
import ActivityLarge from '../../../../__tests__/testdata/ActivityLarge.json'
import {Row } from '../../../atoms';
import { clone } from '../../../../utils/coding';

export default {
    component: ActivityGraph,
    title: 'Molecules/Activities/ActivityGraph',    
  };

const Template = args => <ActivityGraph {...args} />

const convertLog=(log)=> {
    const res = {...log}
    res.speed = log.speed/1.6
    res.distance = log.distance/1600
    res.elevation = log.elevation*3
    return res
}


const imperial = { ...ActivityLarge}
imperial.distance = {value: Number((ActivityLarge.distance/1600).toFixed(1)), unit:'mi'}
imperial.logs = ActivityLarge.logs.map(convertLog)
imperial.stats.speed = { 
    min: {value:6.1, unit:'mph'},
    max: {value:24.5, unit:'mph'},
    avg: {value:21.5, unit:'mph'},
}


export const Default = Template.bind({});
Default.args = {
    ftp: 200,
    activity: ActivityLarge
}

export const Imperial = Template.bind({});
Imperial.args = {
    ftp: 200,
    activity: imperial,
    units: {
        speed:'mph',
        distance:'mi',
        elevation:'ft'

    }
}

export const Short = Template.bind({});
Short.args = {
    ftp: 200,
    activity: Activity
}

export const WidthAndHeight = Template.bind({});
WidthAndHeight.args = {
    ftp: 200,
    activity: ActivityLarge,
    width: '20vw',
    height: '20vh'

}

export const Loading = Template.bind({});
Loading.args = {
    ftp: 200,
    loading: true
}


const TemplateDiv = args => <Row width='10vw' background='grey' height='10vh'><ActivityGraph {...args} /></Row>
export const Div = TemplateDiv.bind({});
Div.args = {
    ftp: 200,
    activity: ActivityLarge
}

const NoFTPActivity = ActivityLarge
delete NoFTPActivity.user.ftp
export const NoFTP = Template.bind({});
NoFTP.args = {
    activity: NoFTPActivity
}



const NoHrmActivity = clone(ActivityLarge)
NoHrmActivity.logs.forEach( l => { delete l.heartrate})
export const NoHrm = Template.bind({});
NoHrm.args = {
    ftp: 200,
    activity: NoHrmActivity
}

