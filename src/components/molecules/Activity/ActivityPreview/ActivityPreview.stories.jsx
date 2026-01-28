import React from 'react';
import {ActivityPreview} from './ActivityPreview';
import Activity from '../../../../__tests__/testdata/activity.json'
import ActivityLarge from '../../../../__tests__/testdata/ActivityLarge.json'
import {Row } from '../../../atoms';

export default {
    component: ActivityPreview,
    title: 'Molecules/Activities/Preview',    
  };

const Template = args => <ActivityPreview {...args} />


export const Default = Template.bind({});
Default.args = {
    ftp: 200,
    activity: ActivityLarge
}

export const Short = Template.bind({});
Short.args = {
    ftp: 200,
    activity: Activity
}

export const WidthAndHeight = Template.bind({});
WidthAndHeight.args = {
    ftp: 200,
    activity: ActivityLarge,
    width: '20vw',
    height: '20vh'

}

export const Loading = Template.bind({});
Loading.args = {
    ftp: 200,
    loading: true
}


const TemplateDiv = args => <Row width='10vw' background='grey' height='10vh'><ActivityPreview {...args} /></Row>
export const Div = TemplateDiv.bind({});
Div.args = {
    ftp: 200,
    activity: ActivityLarge
}

