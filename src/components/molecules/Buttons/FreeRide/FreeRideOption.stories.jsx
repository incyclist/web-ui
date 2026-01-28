import React from 'react';
import {FreeRideOptionButton} from './FreeRideOption';
import { Row } from '../../../atoms';

export default {
    component: FreeRideOptionButton,
    title: 'Molecules/Buttons/FreeRide',
    
  };
const Template = args => <Row background='grey'> <FreeRideOptionButton {...args} /></Row>


export const Default = Template.bind({});
Default.args = {

        pathInfo: {
            id: "R:1111849202,1111849203,1111849204,4648976",
            path: [],
            tags: {},
            direction: 15.060203909799839,
            color: "purple"
        },
        hotkey:'1',
        heading: 0,
        color: "green",
        size: 10
}

export const Selected = Template.bind({});
Selected.args = {

    pathInfo: {
        id: "R:1111849202,1111849203,1111849204,4648976",
        path: [],
        tags: {},
        direction: 15.060203909799839,
        selected: true,
        color: "purple"
    },
    hotkey:'1',
    heading: 0,
    color: "green",
    size: 10
}


export const NoHotkey = Template.bind({});
NoHotkey.args = {

        pathInfo: {
            "id": "R:1111849202,1111849203,1111849204,4648976",
            "path": [],
            "tags": {},
            "direction": 15.060203909799839,
            "color": "purple"
        },
        heading: 0,
        color: "green",
        size: 10
}

export const Red = Template.bind({});
Red.args = {

    pathInfo: {
        "id": "R:1111849202,1111849203,1111849204,4648976",
        "path": [],
        "tags": {},
        "direction": 15.060203909799839,
        "color": "purple"
    },
    heading: 0,
    color: "red",
    size: 10,
    hotkey:'1',

}

export const NoColor = Template.bind({});
NoColor.args = {

    pathInfo: {
        "id": "R:1111849202,1111849203,1111849204,4648976",
        "path": [],
        "tags": {},
        "direction": 15.060203909799839,
        "color": "purple"
    },
    heading: 0,
    size: 10,
    hotkey:'1',

}

export const Text = Template.bind({});
Text.args = {
    text: 'Hello',
    size: 10,
    background: 'red',
    hotkey: '!'
}

export const Image = Template.bind({});
Image.args = {
    id: 'turn',
    size: 10,
    image: 'images/u-turn.svg'
    
}



