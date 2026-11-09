import React from 'react';
import { PairingHelperPanel } from './index';
import { helperNoTrainer, helperTrainerUnavailable } from './PairingHelperPanel.mock';

export default {
    component: PairingHelperPanel,
    title: 'Modules/Pairing/Helper Panel',
};

const Template = args => <div style={{ width: 'max(280px, 28vw)', height: '70vh', background: '#1f2a33' }}><PairingHelperPanel {...args} /></div>;

export const NothingPicked = Template.bind({});
NothingPicked.args = { helper: helperNoTrainer() };

export const AsleepPicked = Template.bind({});
AsleepPicked.args = { helper: helperNoTrainer('asleep') };

export const NoDevicePicked = Template.bind({});
NoDevicePicked.args = { helper: helperNoTrainer('no_device') };

export const TrainerUnavailablePicked = Template.bind({});
TrainerUnavailablePicked.args = { helper: helperTrainerUnavailable('trainer_unavailable') };

export const Resolved = Template.bind({});
Resolved.args = { helper: { ...helperNoTrainer('asleep'), phase: 'resolved', resolvedText: 'Found it! Ready to ride.' } };
