import React from 'react';

import {VideoPreview} from './index';
import styled from 'styled-components';

export default {
  component: VideoPreview,
  title: 'Modules/video/VideoPreview',
  argTypes: { onVideoLoaded: { action: 'loaded' } },
};

const Container = styled.div`
    position:relative;
    width: 400px;
    height:200px;
    min-height: 200px;
    background: red;
`

const Template = args => <Container><VideoPreview {...args} /></Container>;

export const Default = Template.bind({});
Default.args = {
    url :"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4"
};


export const Error = Template.bind({});
Error.args = {
    url :"http://localhost/_does_not_exist"
};