import React from 'react';

import {FreeRideCard} from './index';


//const routeData = route.decoded

export default {
  component: FreeRideCard,
  title: 'Modules/RouteSelection/FreeRide',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <FreeRideCard {...args} />;

export const Default = Template.bind({});
Default.args = {    
    title: 'Free Ride' ,
    height: 500,
    loaded:true,
    visible:true,
    ready:true
};


