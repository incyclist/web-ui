import React from 'react';
import {PrevRideInfo} from './component';


export default {
    component: PrevRideInfo,
    title: 'molecules/Ride/Previous Ride Info', 
  };
  

const DivTemplate =  args => <div style={{width: '20vw'}}> <PrevRideInfo {...args} /></div>;

export const Default = DivTemplate.bind({});
Default.args = {
    position:1,
    avatar: { shirt:'red',helmet:'black'},
    title: 'John Doe',
    distanceGap: '-10m',
    timeGap: '-1s',    
    distance: 57561,
    power:300,
    speed:26

}

export const Current = DivTemplate.bind({});
Current.args = {
    position:1,
    avatar: { shirt:'yellow',helmet:'yellow'},
    title: 'current',
    distanceGap: '-10m',
    timeGap: '-1s',    
    distance: 57561,
    power:300,
    speed:26

}

export const WithHeartrate = DivTemplate.bind({});
WithHeartrate.args = {
    position:1,
    avatar: { shirt:'yellow',helmet:'yellow'},
    title: 'current',
    distanceGap: '-10m',
    timeGap: '-1s',    
    distance: 57561,
    power:300,
    speed:26,
    heartrate:100

}

export const TenPlus = DivTemplate.bind({});
TenPlus.args = {
    position:99,
    avatar: { shirt:'yellow',helmet:'yellow'},
    title: 'current',
    distanceGap: '-10m',
    timeGap: '-1s',    
    distance: 57561,
    power:300,
    speed:26
}

export const UndredPlus = DivTemplate.bind({});
UndredPlus.args = {
    position:499,
    avatar: { shirt:'yellow',helmet:'yellow'},
    title: 'current',
    distanceGap: '-10m',
    timeGap: '-1s',    
    distance: 57561,
    power:300,
    speed:26
}

export const Imperial = DivTemplate.bind({});
Imperial.args = {
    position:99,
    avatar: { shirt:'yellow',helmet:'yellow'},
    title: 'current',
    distanceGap: {value:-1.2,unit:'mi'},
    timeGap: '-1s',    
    distance: {value:33.4,unit:'mi'},
    power:300,
    speed: { value:15, unit:'mph' }
}
