import React from 'react';

import {WorkoutCreateCard} from './index';


//const routeData = route.decoded

export default {
  component: WorkoutCreateCard,
  title: 'Modules/WorkoutSelection/Create',
  argTypes: { onOK: { action: 'OK' } },
};

const Template = args => <WorkoutCreateCard {...args} />;

export const Default = Template.bind({});
Default.args = {    
    height: 500,
    loaded:true,
    visible:true,
    ready:true
};


