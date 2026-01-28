import React, { useState } from 'react';

import {NavigationBar} from './index';
import { MemoryRouter } from 'react-router';

export default {
  component: NavigationBar,
  title: 'molecules/NavigationBar',
  argTypes: { onSelected: { action: 'selected' } },
};




const Template = args => <MemoryRouter><NavigationBar {...args} /></MemoryRouter>;

export const Default = Template.bind({});
Default.args = {};

export const ActivitiesEnabled = Template.bind({});
ActivitiesEnabled.args = {
  ACTIVITIES_UI: true
};
