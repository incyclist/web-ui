import React from 'react';
import {StartRideOverlay,RIDE_MODES, GEAR_STATES, VIDEO_STATES} from './StartRideOverlay';
import { RidePageItems } from '../../PageItems';

export default {
    component: StartRideOverlay,
    title: 'modules/ride/overlays/StartRideView',
    argTypes: { 
        onRetry: { action: 'retry' },
        onCancel: { action: 'cancel' },
    },
};


const Template = args => <StartRideOverlay {...args} />;
const RidePageTemplate = args => <RidePageItems zIndex={1} visible={true} > <StartRideOverlay {...args} /> </RidePageItems>;

export const NotVisible = Template.bind({});
NotVisible.args = {
    visible: false,
};

export const VideoStarting = Template.bind({});
VideoStarting.args = {
    mode: RIDE_MODES.VIDEO,
    videoState: VIDEO_STATES.STARTING,
    visible:true
};

export const VideoBikeDoneVideoStarting = Template.bind({});
VideoBikeDoneVideoStarting.args = {
    mode: RIDE_MODES.VIDEO,
    videoState: VIDEO_STATES.STARTING,
    devices: [
        {name:'Daum 8i',isControl:true, state:GEAR_STATES.STARTING}
    ],   
};

export const VideoBufferingBikeAndHrmStarting = Template.bind({});
VideoBufferingBikeAndHrmStarting.args = {
    mode: RIDE_MODES.VIDEO,
    videoState: VIDEO_STATES.STARTING,
    videoProgress: { loaded: true, buffer:10},
    devices: [
        {name:'Daum 8080',isControl:true, state:GEAR_STATES.STARTING},
        {name:'Polar Hrm',isControl:false, state:GEAR_STATES.STARTING}
    ]
};



export const FreeRideStarting = Template.bind({});
FreeRideStarting.args = {
    mode: RIDE_MODES.FREE_RIDE,
    visible:true,
    devices: [
        {name:'ANT+FE 5797',isControl:true, state:GEAR_STATES.STARTING},
        {name:'ANT+HR 1234',isControl:true, state:GEAR_STATES.STARTING}
    ],   
    mapType: 'StreetView',
    mapState: 'Loading'
};

export const FreeRideBikeFailed = Template.bind({});
FreeRideBikeFailed.args = {
    mode: RIDE_MODES.FREE_RIDE,
    visible:true,
    isMain: true,
    videoState: VIDEO_STATES.IDLE,
    devices: [
        {name:'ANT+FE 5797',isControl:true, state:GEAR_STATES.START_FAILURE},
        {name:'ANT+HR 1234',isControl:false, state:GEAR_STATES.STARTING}
    ],   
    mapType: 'StreetView',
    mapState: 'Loaded'
};

export const FreeRideSensorFailedDuringStart = Template.bind({});
FreeRideSensorFailedDuringStart.args = {
    mode: RIDE_MODES.FREE_RIDE,
    visible:true,
    isMain: true,
    videoState: VIDEO_STATES.IDLE,
    devices: [
        {name:'ANT+FE 5797',isControl:true, state:GEAR_STATES.STARTING},
        {name:'ANT+HR 1234',isControl:false, state:GEAR_STATES.START_FAILURE}
    ],   
    mapType: 'StreetView',
    mapState: 'Loaded'

};

export const FreeRideSensorFailedAfterStart = Template.bind({});
FreeRideSensorFailedAfterStart.args = {
    mode: RIDE_MODES.FREE_RIDE,
    visible:true,
    isMain: true,
    rideState:'startError',
    devices: [
        {name:'ANT+FE 5797',isControl:true, state:GEAR_STATES.START_OK},
        {name:'ANT+HR 1234',isControl:false, state:GEAR_STATES.START_FAILURE}
    ],   
    mapType: 'StreetView',
    mapState: 'Loaded'

};


export const VideoError = Template.bind({});
VideoError.args = {
    mode: RIDE_MODES.VIDEO,
    videoState:VIDEO_STATES.START_FAILED,
    visible:true,
    isMain: true,
    devices: [
        {name:'ANT+FE 5797',isControl:true, state:GEAR_STATES.START_OK},
        {name:'ANT+HR 1234',isControl:false, state:GEAR_STATES.START_OK}
    ],   

};


// Street View-specific states, gated on `viewState`. Every story above has no
// `viewState` and is the acceptance reference for "unchanged".

export const StreetViewPreparing = Template.bind({});
StreetViewPreparing.args = {
    mode: RIDE_MODES.FOLLOW_ROUTE,
    visible: true,
    devices: [
        {name:'KICKR CORE',isControl:true, state:GEAR_STATES.START_OK},
        {name:'HRM-Pro',isControl:false, state:GEAR_STATES.START_OK}
    ],
    mapType: 'Street View',
    viewState: 'loading'
};

export const StreetViewSlow = Template.bind({});
StreetViewSlow.args = {
    mode: RIDE_MODES.FOLLOW_ROUTE,
    visible: true,
    devices: [
        {name:'KICKR CORE',isControl:true, state:GEAR_STATES.START_OK},
        {name:'HRM-Pro',isControl:false, state:GEAR_STATES.START_OK}
    ],
    mapType: 'Street View',
    viewState: 'slow'
};

export const StreetViewFallbackWithFailedSensor = Template.bind({});
StreetViewFallbackWithFailedSensor.args = {
    mode: RIDE_MODES.FOLLOW_ROUTE,
    visible: true,
    readyToStart: true,
    devices: [
        {name:'KICKR CORE',isControl:true, state:GEAR_STATES.START_OK},
        {name:'HRM-Pro',isControl:false, state:GEAR_STATES.START_FAILURE}
    ],
    mapType: 'Street View',
    viewState: 'unavailable',
    viewFallbackCause: 'timeout'
};

export const WithinRidePage = RidePageTemplate.bind({});
WithinRidePage.args = {
    mode: RIDE_MODES.VIDEO,
    videoState: VIDEO_STATES.STARTING,
    visible: true,
};
