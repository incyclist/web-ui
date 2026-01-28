import React from 'react';
import {NearbyRidersView} from './component';
import { Overlay } from '../../../../atoms';

export default {
    component: NearbyRidersView,
    title: 'modules/ride/Nearby Riders List', 
}


const Template =  args => <Overlay background='none' shadow={false} padding={0} border={''} ><NearbyRidersView {...args} /></Overlay>;



const list = [];
list.push ( {isUser: false,
    avatar: { shirt:'yellow', helmet:'red'},
    name: 'J. Doe',
    diffDistance: -10,
    diffTime: -1,    
    distance: 57561,
    power:200.123 ,
})
list.push ( {isUser: true,
    name: 'G. Doumen',
    avatar: { shirt:'orange'},
    diffDistance: -10,
    diffTime: -1,    
    distance: 57551,
    power:200.123 
})
list.push ( {isUser: false,
    name: 'M. Mustermann',
    avatar: { shirt:'white'},
    diffDistance: 6,
    diffTime: 0.6,    
    distance: 57545,
    power:240
})


export const Default = Template.bind({});
Default.args = {
    width: '25vw',
    height: '35vh',
    title: 'Incyclists nearby',
    activeRides:list,

}
