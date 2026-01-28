import React from 'react';
import {RiderInfo} from './rider-info';


export default {
    component: RiderInfo,
    title: 'molecules/Ride/Rider Info', 
  };
  

const DivTemplate =  args => <div style={{width: '20vw'}}> <RiderInfo {...args} /></div>;

export const Default = DivTemplate.bind({});
Default.args = {
    isUser: false,
    name: 'John Doe',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    mpower:3.112
}
export const Coach = DivTemplate.bind({});
Coach.args = {
    isUser: false,
    name: 'Coach',
    avatar: { helmet:'red', shirt:'blue', type:'coach'},
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    mpower:3.112
}

export const OnlyTimeinMs = DivTemplate.bind({});
OnlyTimeinMs.args = {
    isUser: false,
    name: 'John Doe',
    diffTime: -0.7,    
    distance: 57561,
    lap:1
}

export const OnlyTimeinSec = DivTemplate.bind({});
OnlyTimeinSec.args = {
    isUser: false,
    name: 'John Doe',
    diffTime: 27,    
    distance: 57561,
    lap:1
}

export const OnlyTimeinMin = DivTemplate.bind({});
OnlyTimeinMin.args = {
    isUser: false,
    name: 'John Doe',
    diffTime: -281,    
    distance: 57561,
    lap:1
}

export const DistanceGapInKm = DivTemplate.bind({});
DistanceGapInKm.args = {
    isUser: false,
    name: 'John Doe',
    diffDistance: -9870,
    diffTime: -1,    
    distance: 57561,
    mpower:3.112
}

export const DistanceGapInKmLargerThan10 = DivTemplate.bind({});
DistanceGapInKmLargerThan10.args = {
    isUser: false,
    name: 'John Doe',
    diffDistance: -37910,
    diffTime: -1,    
    distance: 57561,
    mpower:3.112
}


export const Lap1 = DivTemplate.bind({});
Lap1.args = {
    isUser: false,
    name: 'John Doe',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    lap:1
}

export const VeryLongName = DivTemplate.bind({});
VeryLongName.args = {
    isUser: false,
    name: 'Very Very Long Name',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561
}

export const Power = DivTemplate.bind({});
Power.args = {
    isUser: false,
    name: 'John Doe',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    power:200.123
}

export const Speed = DivTemplate.bind({});
Speed.args = {
    isUser: false,
    name: 'John Doe',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    speed:29.786
}


export const CurrentUser = DivTemplate.bind({});
CurrentUser.args = {
    isUser: true,
    name: 'Current User',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561
}

export const ShirtRed = DivTemplate.bind({});
ShirtRed.args = {
    isUser: false,
    avatar: { shirt:'red'},
    name: 'John Doe',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    
}

export const HelmetRed = DivTemplate.bind({});
HelmetRed.args = {
    isUser: false,
    avatar: { helmet:'red'},
    name: 'John Doe',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    
}


export const BgRed = DivTemplate.bind({});
BgRed.args = {
    isUser: false,
    name: 'John Doe',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    backgroundColor: 'red'
}

export const TextWhite = DivTemplate.bind({});
TextWhite.args = {
    isUser: false,
    name: 'John Doe',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    textColor: 'white'
}

export const Imperial = DivTemplate.bind({});
Imperial.args = {
    isUser: false,
    name: 'John Doe',
    diffDistance: { value:-150, unit:'yd'},
    diffTime: -1,    
    distance: {value: 35.1, unit:'mi'},
    speed: {value:20, unit:'mph'}
}

