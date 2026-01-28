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

