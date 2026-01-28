import React from 'react';
import { ElevationPreview } from './index';
import sydney from '../../../../__tests__/testdata/sydney.json'

export default {
  component: ElevationPreview,
  title: 'modules/elevation/ElevationPreview', 
};


const testData = [
    {routeDistance: 0, elevation:100, slope: 0} ,
    {routeDistance: 100, elevation:100, slope: 1} ,
    {routeDistance: 200, elevation:101, slope: 2} ,
    {routeDistance: 300, elevation:103, slope: 3} ,
    {routeDistance: 400, elevation:106, slope: 4} ,
    {routeDistance: 500, elevation:110, slope: 5} ,
    {routeDistance: 600, elevation:115, slope: 6} ,
    {routeDistance: 700, elevation:121, slope: 7} ,
    {routeDistance: 800, elevation:128, slope: 8} ,
]


const Template = args => <ElevationPreview {...args} />;
export const Default = Template.bind({});

Default.args = {
    points:sydney.decoded,
    width: 800,
    height: 600,
    color: 'lightgrey'
}

export const Line = Template.bind({});
Line.args = {
    points:sydney.decoded,
    width: 500,
    height: 200,
    color: 'lightgrey',
    line: 'black'
}

export const Points = Template.bind({});
Points.args = {
    points:testData,
    width: 500,
    height: 200,
    color: 'lightgrey',
    line: 'black'
}
