import React from 'react';
import {PrevRides} from './component';
import { Overlay } from '../../../../atoms';

export default {
    component: PrevRides,
    title: 'modules/ride/Previous Rides List', 
}


const Template =  args => <Overlay background='none' shadow={false} padding={0} border={''} ><PrevRides {...args} /></Overlay>;



const list = [];
list.push ( {isUser: false,
    position: 1,
    avatar: { shirt:'red', helmet:'yellow'},
    title: '01.01.2023',
    distanceGap: '10m',
    timeGap: '1s',    
    distance: 57561,
    power:200,
    speed: 36
})
list.push ( {isUser: true,
    position: 2,
    title: 'current',
    avatar: { shirt:'yellow', helmet:'yellow'},
    distanceGap: '',
    timeGap: '',    
    distance: 57551,
    power:199,
    speed:35.1 
})
list.push ( {isUser: false,
    position: 3,
    title: '01.01.2024',
    avatar: { shirt:'white'},
    distanceGap: '-100m',
    timeGap: '-10s',    
    distance: 57451,
    power:240,
    speed:37.5 
})

const imperial = list.map( (e,idx)=> { 
    const i = {...e}
    i.speed = { value:Number((e.speed/1.6).toFixed(1)), unit:'mi'};
    if (idx===0)  {
        i.distanceGap = {value:9.1, unit:'yd'}
    }
    return i
})


export const Default = Template.bind({});
Default.args = {
    width: '25vw',
    height: '35vh',
    title: 'Previous Rides',
    rides:list,

}

export const Imperial = Template.bind({});
Imperial.args = {
    width: '25vw',
    height: '35vh',
    title: 'Previous Rides',
    rides:imperial,

}
