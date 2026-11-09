import React from 'react';
import { PairingConflictCard } from './index';
import { conflictFromDetection } from './PairingConflictCard.mock';

export default {
    component: PairingConflictCard,
    title: 'Modules/Pairing/Conflict Card',
};

const Template = args => <div style={{ width: 'max(280px, 28vw)', height: '70vh', background: '#1f2a33' }}><PairingConflictCard {...args} /></div>;

export const KeepPicked = Template.bind({});
KeepPicked.args = { conflict: conflictFromDetection() };

export const ReplacePicked = Template.bind({});
ReplacePicked.args = { conflict: conflictFromDetection({ choice: 'replace' }) };

export const MoreWaiting = Template.bind({});
MoreWaiting.args = { conflict: conflictFromDetection({ queued: 1 }) };
