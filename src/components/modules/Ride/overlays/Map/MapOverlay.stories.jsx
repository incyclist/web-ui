import  {MapOverlay} from './MapOverlay'
import sydney from '../../../../../__tests__/testdata/sydney.json'
import React from 'react'
import { Overlay } from '../../../../atoms';

export default {
    component: MapOverlay,
    title: 'modules/ride/overlays/MapOverlay', 
}


const Template =  args => <Overlay background='none' shadow={false} padding={0} border={''} ><MapOverlay {...args} /></Overlay>;

export const Default = Template.bind({});
Default.args = {
    width: '25vw',
    height: '35vh',
    routeData: sydney,
    position: sydney.decoded[0]
}


export const WithMarkers = Template.bind({});
WithMarkers.args = {
    width: '25vw',
    height: '35vh',
    routeData: sydney,
    position: sydney.decoded[0],
    markers:[
        {...sydney.decoded[10], avatar:{shirt:'red'} },
        {...sydney.decoded[12], avatar:{shirt:'green'} }
    ]
}

export const WithStartPos = Template.bind({});
WithStartPos.args = {
    width: '25vw',
    height: '35vh',
    routeData: sydney,
    position: sydney.decoded[10],
    startPos: 100,
}

export const WithStartEndPos = Template.bind({});
WithStartEndPos.args = {
    width: '25vw',
    height: '35vh',
    routeData: sydney,
    position: sydney.decoded[10],
    startPos: 100,
    endPos: 1000
}


