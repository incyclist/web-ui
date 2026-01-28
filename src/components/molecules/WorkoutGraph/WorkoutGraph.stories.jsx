import React from 'react';
import styled from 'styled-components';
import {WorkoutGraph} from './WorkoutGraph';


//const routeData = route.decoded
import { Segment, Workout } from 'incyclist-services';

export default {
    component: WorkoutGraph,
    title: 'Molecules/WorkoutGraph'
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

const Parent = styled.div`
    width: 800px;
    height: 600px;
    background: darkblue;
`

const Template = args => <WorkoutGraph {...args} />;
const TemplateDiv = args => <Parent><WorkoutGraph {...args} /></Parent>

const wo1 = new Workout( {
    "name": "Test Workout",
    "type": "workout",
    "steps": [
        {
            "cooldown": false,
            "duration": 300,
            "power": {
                "max": 50,
                "type": "pct of FTP"
            },
            "steady": true,
            "text": "",
            "type": "step",
            "work": true
        },
        {
            "cooldown": false,
            "duration": 300,
            "power": {
                "max": 65,
                "type": "pct of FTP"
            },
            "steady": true,
            "text": "",
            "type": "step",
            "work": true
        },
        {
            "cooldown": false,
            "duration": 300,
            "power": {
                "max": 80,
                "type": "pct of FTP"
            },
            "steady": true,
            "text": "",
            "type": "step",
            "work": true
        },
        {
            "cooldown": false,
            "duration": 600,
            "power": {
                "max": 75,
                "min": 25,
                "type": "pct of FTP"
            },
            "steady": false,
            "text": "",
            "type": "step",
            "work": true
        },
        {
            "cooldown": true,
            "duration": 600,
            "power": {
                "max": 75,
                "min": 25,
                "type": "pct of FTP"
            },
            "steady": false,
            "text": "",
            "type": "step",
            "work": true
        },
        {
            "cooldown": false,
            "duration": 300,
            "power": {
                "max": 95,
                "type": "pct of FTP"
            },
            "steady": true,
            "text": "",
            "type": "step",
            "work": true
        },
        {
            "cooldown": false,
            "duration": 300,
            "power": {
                "max": 110.00000000000001,
                "type": "pct of FTP"
            },
            "steady": true,
            "text": "",
            "type": "step",
            "work": true
        },
        {
            "cooldown": false,
            "duration": 60,
            "power": {
                "max": 125,
                "type": "pct of FTP"
            },
            "steady": true,
            "text": "",
            "type": "step",
            "work": true
        },
        {
            "cooldown": false,
            "duration": 600,
            "steady": true,
            "text": "",
            "type": "step",
            "work": false
        },
        {
            "type": "segment",
            "repeat": 3,
            "text": "Test Segment",
            "steps": [
                {
                    "cooldown": false,
                    "duration": 60,
                    "power": {
                        "max": 75,
                        "type": "pct of FTP"
                    },
                    "steady": true,
                    "text": "Gib gas!",
                    "type": "step",
                    "work": true
                },
                {
                    "cooldown": false,
                    "duration": 300,
                    "power": {
                        "max": 50,
                        "type": "pct of FTP"
                    },
                    "steady": true,
                    "text": "",
                    "type": "step",
                    "work": false
                }
            ]
        }
    ]
} )


export const Default = Template.bind({});
Default.args = {
    workout: wo1,
    ftp:200,
    width:800,
    height:600
}

export const Div = TemplateDiv.bind({});
Div.args = {
    workout: wo1,
    ftp:200
}


export const Position = Template.bind({});
Position.args = {
    workout: wo1,
    ftp:200,
    width:800,
    height:600,
    position:[{x:600}]
}

export const DashBoardMode = Template.bind({});
DashBoardMode.args = {
    dashboard:true,
    workout: wo1,
    ftp:200,
    width:800,
    height:600,
    position:[{x:600}]
}


export const ZoomEnabled = Template.bind({});
ZoomEnabled.args = {
    enableZoom:true,
    workout: wo1,
    ftp:200,
    width:800,
    height:600,
}

export const StartStop = Template.bind({});
StartStop.args = {
    workout: wo1,
    ftp:200,
    width:800,
    height:600,
    start: 0,
    stop: 500
}

export const ShowDetails = Template.bind({});
ShowDetails.args = {
    showDetails:true,
    workout: wo1,
    ftp:200,
    width:800,
    height:600,
    position:[{x:600}]
}
