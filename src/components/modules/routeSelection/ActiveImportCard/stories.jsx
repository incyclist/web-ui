import React from 'react';

import {ActiveImportCard} from './index';


//const routeData = route.decoded

export default {
  component: ActiveImportCard,
  title: 'Modules/RouteSelection/ActiveImport',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <ActiveImportCard {...args} />;

export const Default = Template.bind({});
Default.args = {    
    height: 500,
    fileName: 'DE_Test.epm'
};


export const Error = Template.bind({});
Error.args = {    
    height: 500,
    fileName: 'DE_Test.epm',
    error:'Some Error'
};

