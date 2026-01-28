import React from 'react';
import { Workout,Segment } from 'incyclist-services';

import WorkoutDashboard from './component';
import {Overlay} from '../../../atoms';

export default {
    component: WorkoutDashboard,
    
    title: 'Modules/Workout/Dashboard',
    argTypes: { 
        onBackward: { action: 'backward' }, 
        onForward: { action: 'forward' } ,
        onPowerUp: { action: 'powerUp' },
        onPowerDown: { action: 'powerDown' }
    },
  };

const Template = args => <Overlay padding='0' margin='0' top='10vh' height='10vh' left='25vw' width='50vw'> <WorkoutDashboard {...args} /></Overlay>
let workout

try{
    const wo = new Workout({name:'Test Workout'});

    const s = new Segment( {  repeat: 10,
        steps: [
            { duration: 180, power:{min:80, max:100,type:'pct of FTP'}, steady:true, work:true } ,
            { duration: 180, power:{min:100, max:120,type:'pct of FTP'}, steady:true, work:true } ,
            { duration: 180, power:{min:120, max:140,type:'pct of FTP'}, steady:true, work:true } 
        ]
    })
    wo.addSegment( s)
    workout = wo;    
}
catch(err) {
    console.log('~~~ ERROR',err)
}



export const Start = Template.bind({});
Start.args = {
    workout,
    title:'Test Workout',    
    numDataColumns: 3,
    current: {
        minPower: 80,
        maxPower:100,
        duration: 180,
        time:0,
        remaining: 180
    }
}

export const AllowBack = Template.bind({});
AllowBack.args = {
    workout,
    title:'Test Workout',    
    numDataColumns: 3,
    canShowBackward: true,
    current: {
        minPower: 80,
        maxPower:100,
        duration: 180,
        time:0,
        remaining: 180
    }
}

export const AllowForward = Template.bind({});
AllowForward.args = {
    workout,
    title:'Test Workout',    
    numDataColumns: 3,
    canShowForward: true,
    current: {
        minPower: 80,
        maxPower:100,
        duration: 180,
        time:0,
        remaining: 180
    }
}

export const AllowBoth = Template.bind({});
AllowBoth.args = {
    workout,
    title:'Test Workout',    
    numDataColumns: 3,
    canShowBackward: true,
    canShowForward: true,
    current: {
        minPower: 80,
        maxPower:100,
        duration: 180,
        time:0,
        remaining: 180
    }
}

export const WithFTP = Template.bind({});
WithFTP.args = {
    workout,
    title:'Test Workout',    
    numDataColumns: 3,
    ftp:200,
    current: {
        minPower: 80,
        maxPower:100,
        duration: 180,
        time:0,
        remaining: 180
    }
}


export const MinEqualsMax = Template.bind({});
MinEqualsMax.args = {
    workout,
    title:'Test Workout',    
    numDataColumns: 3,
    current: {
        minPower: 100,
        maxPower:100,
        time:100,
        duration: 180,
        remaining: 80
    }
}

export const NoMax = Template.bind({});
NoMax.args = {
    workout,
    title:'Test Workout',    
    numDataColumns: 3,
    current: {
        minPower: 100,
        maxPower:100,
        time:200,
        duration: 180,
        remaining: 160
    }
}

export const WithSlope = Template.bind({});
WithSlope.args = {
    workout,
    title:'Test Workout',
    numDataColumns: 4,
    current: {
        minPower: 120,
        maxPower:120,
        duration: 60,
        remaining: 10
    }
}


export const WithZoom = Template.bind({});
WithZoom.args = {
    workout,
    title:'Test Workout',
    numDataColumns: 4,
    current: {
        minPower: 120,
        maxPower:120,
        duration: 180,
        remaining: 160,
        time: 9*60*3+20         
    },
    start:9*60*3+10,
    stop:9*60*3+10 + 60*10
    

}
