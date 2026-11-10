import React from 'react';
import { ConflictStepDialog } from './index';
import { conflictFromDetection, conflictFromPick } from './ConflictStepDialog.mock';

export default {
    component: ConflictStepDialog,
    title: 'Modules/Pairing/Conflict Dialog',
};

const Template = args => <div style={{ width: '100vw', height: '100vh', background: '#1f2a33' }}><ConflictStepDialog {...args} /></div>;

// a device found by the search, the way the pairing screen shows it: buttons held back for a moment
export const SingleRow = Template.bind({});
SingleRow.args = { conflict: conflictFromDetection({ single: true }), armDelay: 500 };

export const MultipleRows = Template.bind({});
MultipleRows.args = { conflict: conflictFromDetection(), armDelay: 500 };

export const MultipleRowsReplacePicked = Template.bind({});
MultipleRowsReplacePicked.args = { conflict: conflictFromDetection({ choice: 'replace' }), armDelay: 500 };

export const MoreWaiting = Template.bind({});
MoreWaiting.args = { conflict: conflictFromDetection({ queued: 1 }), armDelay: 500 };

export const SingleRowMoreWaiting = Template.bind({});
SingleRowMoreWaiting.args = { conflict: conflictFromDetection({ single: true, queued: 2 }), armDelay: 500 };

// the second step of a pick in the Resistance list, as the device list shows it
export const AfterPick = Template.bind({});
AfterPick.args = { conflict: conflictFromPick(), id: 'DeviceSelector' };
