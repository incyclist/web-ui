import React from 'react'
import { RouteOptions } from './RouteOptions';

export default {
    component: RouteOptions,
    title: 'modules/ride/overlays/RouteOptions', 
    argTypes: {
        screenshot: { control: 'boolean' },
        settings: { control: 'boolean' },
        optionsDelay: { control: 'number' },
        options: { control: 'object' },
        onOptionsVisibleChanged: { action: 'onOptionsVisibleChanged' },
        onOptionSelected: { action: 'onOptionSelected' },
        onScreenshot: { action: 'onScreenshot' },
        onSettings: { action: 'onSettings' },
        onTurn: { action: 'onTurn' }
    }
}


const Template = args => <div style={{width:'400px', height:'200px', background:'black', position:'relative'}}><RouteOptions {...args} /></div>
const Full = args => <div style={{width:'800px', height:'600px', background:'white', position:'relative'}}><RouteOptions {...args} /></div>

export const Default = Template.bind({});
Default.args = {
    screenshot:true,
    settings:true,
    options: [
        { id: '1', name: 'Option 1', color: 'red', selected: false, direction:0 },
        { id: '2', name: 'Option 2', color: 'blue', selected: false, direction:90 },
        { id: '3', name: 'Option 3', color: 'green', selected: true,direction:-90 }
    ],
    optionsDelay: 3000,

}

export const DistanceNumeric = Full.bind({});
DistanceNumeric.args = {
    isNearby: true,
    screenshot:false,
    settings:false,
    distance: 1200,
    pinned:true,
    options: [
        { id: '1', name: 'Option 1', color: 'red', selected: false, direction:0 },
        { id: '2', name: 'Option 2', color: 'blue', selected: false, direction:90 },
        { id: '3', name: 'Option 3', color: 'green', selected: true,direction:-90 }
    ],
    optionsDelay: 3000,

}

export const DistanceObject = Full.bind({});
DistanceObject.args = {
    isNearby: true,
    screenshot:false,
    settings:false,
    distance: { value: 1200, unit:'yd' },
    pinned:true,
    options: [
        { id: '1', name: 'Option 1', color: 'red', selected: false, direction:0 },
        { id: '2', name: 'Option 2', color: 'blue', selected: false, direction:90 },
        { id: '3', name: 'Option 3', color: 'green', selected: true,direction:-90 }
    ],
    optionsDelay: 3000,

}
