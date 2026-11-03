import React from 'react'
import { RideViewRestrictionDialogView } from './RideViewRestrictionDialogView'

export default {
    component: RideViewRestrictionDialogView,
    title: 'modules/Ride/RideViewRestrictionDialog',
    argTypes: { onClose: { action: 'close' }, onDiscard: { action: 'discard' }, onAddKey: { action: 'add key' }, onReminderChanged: { action: 'reminder' } },
}

const body = 'Street View and Satellite View use Google Maps, and Google charges Incyclist for every ride that uses them. To keep Incyclist free, these views come with rides on a connected device. A simulated ride shows the Map instead.'

const device = {
    id: 'device',
    heading: 'Ride with a device',
    text: 'Connect your smart trainer, power meter or speed sensor before you start. Street View then works as usual.',
}
const discard = {
    label: 'Discard ride and connect a device',
    confirm: { question: 'Discard this simulated ride?', confirmLabel: 'Discard and connect', cancelLabel: 'Keep riding' },
}
const ownKey = {
    id: 'own-key',
    heading: 'Or use your own Google Maps API key',
    text: 'With your own key, Street View and Satellite View also work in simulated rides. Google then bills each ride that uses them to your own Google account.',
    addKey: { label: 'Add my key' },
    helpLink: { label: 'How to create a key', url: 'https://incyclist.com/maps-api-key/' },
}

const Template = args => <RideViewRestrictionDialogView {...args} />

export const InRide = Template.bind({})
InRide.args = {
    title: 'Street View in simulated rides', body,
    options: [{ ...device, discard }, ownKey],
    reminder: { label: 'Remind me in simulated rides', checked: true },
}

export const OutsideRide = Template.bind({})
OutsideRide.args = {
    title: 'Street View in simulated rides', body,
    options: [device, ownKey],
}

export const KeySavedPendingRestart = Template.bind({})
KeySavedPendingRestart.args = {
    title: 'Street View in simulated rides', body,
    options: [{ ...device, discard }, { ...ownKey, addKey: undefined, pendingRestart: { text: 'Saved. Restart Incyclist to use it.' } }],
    reminder: { label: 'Remind me in simulated rides', checked: false },
}
