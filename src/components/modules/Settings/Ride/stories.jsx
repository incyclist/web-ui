import React from 'react';
import { EventLogger,ConsoleAdapter } from 'gd-eventlog';
import {RideSettingsView} from './component';
import {RIDE_MODES, RIDEVIEW} from './consts';
import { Dialog } from '../../../molecules';

export default {
  component: RideSettingsView,
  title: 'Modules/Settings/Ride',
  argTypes: { 
    onRideViewSelected: { action: 'ride view changed' } ,
    onChangeRealityFactor: { action: 'reality factor changed' } ,
    onMapsApiKeyChanged: { action: 'maps API changed' } ,
    onCoachEditDone: { action: 'coach edit done'},
    onAddCoach: { action: 'add coach'}

  }

};



const Template = args => <Dialog><RideSettingsView {...args} /></Dialog>;

EventLogger.registerAdapter(new ConsoleAdapter({depth:1}))

export const Default = Template.bind({});
Default.args = {
    rideView: RIDEVIEW.STREETVIEW,
    coachSupported:true

}

export const FreeRideLegacy = Template.bind({});
FreeRideLegacy.args = {
    legacyRideMode: RIDE_MODES.FREE_RIDE,
    rideView: RIDEVIEW.STREETVIEW
}

export const FollowRouteLegacy = Template.bind({});
FollowRouteLegacy.args = {
    legacyRideMode: RIDE_MODES.FOLLOW_ROUTE,
    rideView: RIDEVIEW.STREETVIEW,
    hasElevation: true,
    reality: 100,

}

export const VideoLegacy = Template.bind({});
VideoLegacy.args = {
    legacyRideMode: RIDE_MODES.VIDEO,
    hasElevation: true,
    reality: 100,
}

export const FreeRide = Template.bind({});
FreeRide.args = {
    rideMode: 'Free-Ride',
    rideView: RIDEVIEW.STREETVIEW
}

export const FollowRoute = Template.bind({});
FollowRoute.args = {
    rideMode:'GPX',
    rideView: RIDEVIEW.STREETVIEW

}

export const Video = Template.bind({});
Video.args = {
    rideMode: 'Video',
    hasElevation: true,
    reality: 80,
}

export const Workout = Template.bind({});
Workout.args = {
    rideMode: 'Workout'
}



const restrictedOption = (label) => ({ label, disabled: true, message: 'Not available in simulated rides', reason: 'simulation' })

export const SimulatedRideRestricted = Template.bind({});
SimulatedRideRestricted.args = {
    isRide: true,
    rideMode: 'GPX',
    rideView: RIDEVIEW.MAP,
    rideViewOptions: new Map([['sv', restrictedOption('Street View')], ['map', { label: 'Map' }], ['sat', restrictedOption('Satellite View')]]),
    rideViewHelp: { label: 'How to get Street View' },
    mapsApiKey: 'AIzaSyB0123456789012345678901234567890',
}

export const MapsKeySavedPendingRestart = Template.bind({});
MapsKeySavedPendingRestart.args = {
    rideView: RIDEVIEW.STREETVIEW,
    mapsApiKey: 'AIzaSyB0123456789012345678901234567890',
    mapsKeyPendingRestart: true,
}

export const MapsApiKeyHelp = Template.bind({});
MapsApiKeyHelp.args = {
    rideView: RIDEVIEW.STREETVIEW,
}
MapsApiKeyHelp.play = async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Info about Maps API Key' }))
}
