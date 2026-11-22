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

export const FreeRideBikeFailed = Template.bind({});
FreeRideBikeFailed.args = {
    mode: RIDE_MODES.FREE_RIDE,
    visible:true,
    devices: [
        {name:'ANT+FE 5797',isControl:true, state:GEAR_STATES.START_FAILURE},
        {name:'ANT+HR 1234',isControl:false, state:GEAR_STATES.STARTING}
    ],
};

export const VideoError = Template.bind({});
VideoError.args = {
    mode: RIDE_MODES.VIDEO,
    videoState:VIDEO_STATES.START_FAILED,
    visible:true,
    devices: [
        {name:'ANT+FE 5797',isControl:true, state:GEAR_STATES.START_OK},
        {name:'ANT+HR 1234',isControl:false, state:GEAR_STATES.START_OK}
    ],
};

export const MapError = Template.bind({});
MapError.args = {
    mode: RIDE_MODES.FREE_RIDE,
    visible:true,
    mapStateError: 'Could not load map',
    devices: [
        {name:'ANT+FE 5797',isControl:true, state:GEAR_STATES.START_OK}
    ],
};

export const WithinRidePage = RidePageTemplate.bind({});
WithinRidePage.args = {
    mode: RIDE_MODES.VIDEO,
    visible: true,
    startPhase: 'devices',
    devices: [
        {udid:'t1', name:'KICKR CORE', isControl:true, status:'Starting', startState:'starting'}
    ],
    startContent: {kind:'video', label:'Video', state:'loading'},
};


// Phased start overlay (`startPhase` set). Every ride type x phase.

const PT = (name='KICKR CORE', o={}) => ({udid:'t1', name, isControl:true, status:'Started', startState:'started', ...o})
const PS = (name='HRM-Pro', o={}) => ({udid:'h1', name, isControl:false, status:'Started', startState:'started', ...o})
const STARTING = {status:'Starting', startState:'starting'}
const NOT_CONNECTED = {status:'Error', startState:'not-connected', canRetry:true, canIgnore:true}
const SLOW_SENSOR = {...STARTING, slow:true, canRetry:true, canIgnore:true}

const MAP = state => ({kind:'map', label:'Map', state})
const SAT = state => ({kind:'satellite', label:'Satellite', state})
const SV = state => ({kind:'streetview', label:'Street View', state})
const VIDEO = (state, progress) => ({kind:'video', label:'Video', state, progress})

const phased = (mode, args) => ({ mode, visible:true, onRetryDevice: ()=>{}, onIgnoreDevice: ()=>{}, ...args })

// Workout-only
export const PhasedWorkoutDevices = Template.bind({});
PhasedWorkoutDevices.args = phased('Workout', { startPhase:'devices', devices:[PT('KICKR CORE',STARTING), PS('HRM-Pro',STARTING)] });

export const PhasedWorkoutReady = Template.bind({});
PhasedWorkoutReady.args = phased('Workout', { startPhase:'ready', readyToStart:true, devices:[PT(), PS('HRM-Pro',STARTING)],
    startReadyInfo:{pendingSensors:['HRM-Pro'], notConnectedSensors:[], viewFallback:false} });

// GPX map
export const PhasedMapDevices = Template.bind({});
PhasedMapDevices.args = phased('GPX', { startPhase:'devices', devices:[PT('KICKR CORE',STARTING), PS()], startContent:MAP('loading') });

export const PhasedMapContent = Template.bind({});
PhasedMapContent.args = phased('GPX', { startPhase:'content', devices:[PT(), PS()], startContent:MAP('loading') });

export const PhasedSatelliteContent = Template.bind({});
PhasedSatelliteContent.args = phased('GPX', { startPhase:'content', devices:[PT(), PS()], startContent:SAT('loading') });

export const PhasedMapContentSlow = Template.bind({});
PhasedMapContentSlow.args = phased('GPX', { startPhase:'content', startSlow:true, devices:[PT(), PS()], startContent:MAP('loading') });

export const PhasedMapReadySensorNotConnected = Template.bind({});
PhasedMapReadySensorNotConnected.args = phased('GPX', { startPhase:'ready', readyToStart:true, devices:[PT(), PS('HRM-Pro',NOT_CONNECTED)], startContent:MAP('ready'),
    startReadyInfo:{pendingSensors:[], notConnectedSensors:['HRM-Pro'], viewFallback:false} });

export const PhasedMapReadySeveralSensors = Template.bind({});
PhasedMapReadySeveralSensors.args = phased('GPX', { startPhase:'ready', readyToStart:true,
    devices:[PT(), PS('HRM-Pro',NOT_CONNECTED), PS('Cadence',{udid:'c1',...SLOW_SENSOR})], startContent:MAP('ready'),
    startReadyInfo:{pendingSensors:['Cadence'], notConnectedSensors:['HRM-Pro'], viewFallback:false} });

export const PhasedSensorIgnored = Template.bind({});
PhasedSensorIgnored.args = phased('GPX', { startPhase:'ready', readyToStart:true,
    devices:[PT(), PS('HRM-Pro',{startState:'ignored', status:'Error', canRetry:true})], startContent:MAP('ready'),
    startReadyInfo:{pendingSensors:[], notConnectedSensors:[], viewFallback:false} });

export const PhasedTrainerSlow = Template.bind({});
PhasedTrainerSlow.args = phased('GPX', { startPhase:'devices', startSlow:true,
    devices:[PT('KICKR CORE',{...STARTING, slow:true, canRetry:true}), PS()], startContent:MAP('loading') });

export const PhasedTrainerUploading = Template.bind({});
PhasedTrainerUploading.args = phased('GPX', { startPhase:'devices',
    devices:[PT('Daum 8i',{status:'Starting', startState:'uploading', stateText:'Uploading (42%)'})], startContent:MAP('waiting') });

// Street View
export const PhasedStreetViewContent = Template.bind({});
PhasedStreetViewContent.args = phased('GPX', { startPhase:'content', viewState:'loading', devices:[PT(), PS()], startContent:SV('loading') });

export const PhasedStreetViewSlow = Template.bind({});
PhasedStreetViewSlow.args = phased('GPX', { startPhase:'content', viewState:'slow', startSlow:true, devices:[PT(), PS()], startContent:SV('loading') });

export const PhasedStreetViewFallbackReady = Template.bind({});
PhasedStreetViewFallbackReady.args = phased('GPX', { startPhase:'ready', readyToStart:true, viewState:'unavailable', devices:[PT(), PS()],
    startContent:SV('unavailable'), startReadyInfo:{pendingSensors:[], notConnectedSensors:[], viewFallback:true} });

// Free Ride
export const PhasedFreeRideDevices = Template.bind({});
PhasedFreeRideDevices.args = phased('Free-Ride', { startPhase:'devices', devices:[PT('KICKR CORE',STARTING), PS('HRM-Pro',SLOW_SENSOR)], startContent:MAP('loading') });

export const PhasedFreeRideContent = Template.bind({});
PhasedFreeRideContent.args = phased('Free-Ride', { startPhase:'content', devices:[PT(), PS()], startContent:MAP('loading') });

export const PhasedFreeRideReady = Template.bind({});
PhasedFreeRideReady.args = phased('Free-Ride', { startPhase:'ready', readyToStart:true, devices:[PT(), PS('HRM-Pro',NOT_CONNECTED)], startContent:MAP('ready'),
    startReadyInfo:{pendingSensors:[], notConnectedSensors:['HRM-Pro'], viewFallback:false} });

// Video (MP4)
export const PhasedVideoDevices = Template.bind({});
PhasedVideoDevices.args = phased('Video', { startPhase:'devices', devices:[PT('KICKR CORE',STARTING), PS()], startContent:VIDEO('loading') });

export const PhasedVideoBuffering = Template.bind({});
PhasedVideoBuffering.args = phased('Video', { startPhase:'content', videoProgress:{loaded:true, bufferTime:4}, devices:[PT(), PS()], startContent:VIDEO('loading') });

export const PhasedVideoReady = Template.bind({});
PhasedVideoReady.args = phased('Video', { startPhase:'ready', readyToStart:true, devices:[PT(), PS('HRM-Pro',SLOW_SENSOR)], startContent:VIDEO('ready'),
    startReadyInfo:{pendingSensors:['HRM-Pro'], notConnectedSensors:[], viewFallback:false} });

// Video (AVI converting)
export const PhasedAviDevices = Template.bind({});
PhasedAviDevices.args = phased('Video', { startPhase:'devices', devices:[PT('KICKR CORE',STARTING), PS()], startContent:VIDEO('loading',{convertPct:0}) });

export const PhasedAviConverting = Template.bind({});
PhasedAviConverting.args = phased('Video', { startPhase:'content', devices:[PT(), PS()], startContent:VIDEO('loading',{convertPct:42, convertSeconds:84}) });

export const PhasedAviSlow = Template.bind({});
PhasedAviSlow.args = phased('Video', { startPhase:'content', startSlow:true, devices:[PT(), PS()], startContent:VIDEO('loading',{convertPct:42}) });

export const PhasedAviReady = Template.bind({});
PhasedAviReady.args = phased('Video', { startPhase:'ready', readyToStart:true, devices:[PT(), PS('HRM-Pro',NOT_CONNECTED)], startContent:VIDEO('ready',{convertPct:60}),
    startReadyInfo:{pendingSensors:[], notConnectedSensors:['HRM-Pro'], viewFallback:false} });

// Height budget: slow trainer and two sensors with actions
export const PhasedFiveRows = Template.bind({});
PhasedFiveRows.args = phased('GPX', { startPhase:'devices', startSlow:true,
    devices:[PT('KICKR CORE',{...STARTING, slow:true, canRetry:true}), PS('HRM-Pro',NOT_CONNECTED), PS('Cadence',{udid:'c1',...SLOW_SENSOR})], startContent:MAP('loading') });

// Responsive checks (the box sizes follow the viewport: check at 800x600, 1366x768 and 1920x1080)
export const PhasedLongDeviceNames = Template.bind({});
PhasedLongDeviceNames.args = phased('GPX', { startPhase:'devices', startSlow:true,
    devices:[PT('Wahoo KICKR CORE 1A2B',{...STARTING, slow:true, canRetry:true}), PS('Heart Rate Monitor Pro Strap',SLOW_SENSOR), PS('DCSIM FTMS',{udid:'c1',...NOT_CONNECTED})], startContent:SV('unavailable') });

export const PhasedAviConvertingSlowSensor = Template.bind({});
PhasedAviConvertingSlowSensor.args = phased('Video', { startPhase:'content', devices:[PT('DCSIM FTMS'), PS('BikeController',SLOW_SENSOR), PS('HRM-Pro',NOT_CONNECTED)],
    startContent:VIDEO('loading',{convertPct:42, convertSeconds:84}) });
