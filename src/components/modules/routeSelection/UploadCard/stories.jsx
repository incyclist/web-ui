import React from 'react';

import {UploadCard} from './index';


//const routeData = route.decoded

export default {
  component: UploadCard,
  title: 'Modules/RouteSelection/Upload',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <UploadCard {...args} />;

export const Default = Template.bind({});
Default.args = {    
    height: 500,
    loaded:true,
    visible:true,
    ready:true
};


