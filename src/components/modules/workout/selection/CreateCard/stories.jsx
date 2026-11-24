import React from 'react';
import { WorkoutCreateCard } from './index';

export default {
    component: WorkoutCreateCard,
    title: 'Modules/WorkoutSelection/Create',
    argTypes: { onOK: { action: 'OK' } },
};

const Template = args => <WorkoutCreateCard {...args} />;

export const Default = Template.bind({});
Default.args = {
    width: 280,
    height: 320,
    visible: true,
};

export const ListView = Template.bind({});
ListView.args = {
    layout: 'list',
    visible: true,
};
