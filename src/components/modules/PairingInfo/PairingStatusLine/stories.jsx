import React from 'react';
import { PairingStatusLine } from './index';

export default {
    component: PairingStatusLine,
    title: 'Modules/Pairing/Status Line',
    argTypes: { onLinkClick: { action: 'link clicked' } },
};

const Template = args => <div style={{ background: '#1f2a33', padding: '2vh' }}><PairingStatusLine {...args} /></div>;

export const Searching = Template.bind({});
Searching.args = {
    status: { id: 'S5', dot: 'amber', text: 'Searching for devices… Tip: pedal a few strokes to wake up your trainer.' },
};

export const StillSearching = Template.bind({});
StillSearching.args = {
    status: { id: 'S6', dot: 'amber', text: 'Still searching…', link: "Can't find your trainer?" },
};

export const TrainerUnreachable = Template.bind({});
TrainerUnreachable.args = {
    status: { id: 'S7', dot: 'amber', text: "Can't reach your trainer Tacx Flux. Pedal a few strokes to wake it up.", link: 'Not available today?' },
};

export const NothingCanSearch = Template.bind({});
NothingCanSearch.args = {
    status: { id: 'S1', dot: 'red', text: "Can't search: Bluetooth and ANT+ are both unavailable.", link: 'Check connections' },
};

export const Ready = Template.bind({});
Ready.args = {
    status: { id: 'S2', dot: 'green', text: 'Ready to ride with Tacx Flux. You can add optional sensors, or press OK.' },
};
