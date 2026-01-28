import React from 'react';

import {FreeRideSettingsView} from './FreeRideSettingsView';

export default {
  component: FreeRideSettingsView,
  title: 'Modules/RouteSelection/FreeRideSettings',
  argTypes: { 
    onCancel: { action: 'cancel' } , 
    onChange: { action: 'change' },
    onStart: { action: 'start' },
  }
};

const Template = args => <FreeRideSettingsView {...args} />;

const position = { 
  lat:26.6865155, lng:-80.0351818
}


export const Loading = Template.bind({});
Loading.args = {
    position,
    loading: true,
    noTitle: true,
    noSettings: true,
};

export const TwoOptions = Template.bind({});

TwoOptions.args = {
  noTitle: true,
  noSettings: true,

  position,
  options: [
    { color: 'red', text: 'A', path:[position,{lat:26.6865630, lng:-80.0372570} ]  },
    { color: 'green', text: 'B', path:[position,{lat:26.6865040, lng:-80.0346800} ]  }
  ]
    
};

export const NoOption = Template.bind({});

NoOption.args = {
  noTitle: true,
  noSettings: true,

  position:{lat:51.18043270952056,lng:6.40791009405025},
  options: [
  ],
  
    
    
};
