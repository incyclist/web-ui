import React from 'react';

import { FolderTile } from './index';

export default {
  component: FolderTile,
  title: 'molecules/FolderTile',
  argTypes: { onSelect: { action: 'selected' } },
};

const Template = args => <FolderTile {...args} />;

export const Default = Template.bind({});
Default.args = { text: 'Click to select a folder', width: 400, height: 150 };

export const Disabled = Template.bind({});
Disabled.args = { text: 'Click to select a folder', width: 400, height: 150, disabled: true };
