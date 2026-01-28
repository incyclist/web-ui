import React from 'react';
import {ElevationGraph} from './ElevationGraph';
import { EventLogger,ConsoleAdapter } from 'gd-eventlog';

import testData from '../../../__tests__/testdata/ES_Teide.json'
import sydney from '../../../__tests__/testdata/sydney.json'
import { Autosize } from '../../atoms';

EventLogger.registerAdapter(new ConsoleAdapter({depth:1}))

export default {
  component: ElevationGraph,
  title: 'molecules/Elevation Graph', 
};

const testDataX = { decoded: [
    {routeDistance: 0, elevation:100, slope: 0} ,
    {routeDistance: 100, elevation:100, slope: 1} ,
    {routeDistance: 200, elevation:101, slope: 2} ,
    {routeDistance: 300, elevation:103, slope: 3} ,
    {routeDistance: 400, elevation:106, slope: 4} ,
    {routeDistance: 500, elevation:110, slope: 5} ,
    {routeDistance: 600, elevation:115, slope: 6} ,
    {routeDistance: 700, elevation:121, slope: 7} ,
    {routeDistance: 800, elevation:128, slope: 8} ,
],
distance: 800}

const Test = (props) => {
    return( 
        <div style={{width:'800px', height:'600px',backgroundColor:'red'}}>

                <div style={{height:'50%', backgroundColor:'red'}}>
                    <ElevationGraph {...props} />
                </div>
                <div style={{height:'50%', backgroundColor:'green'}}>
                    <div height='100%'>
                        Hello
                    </div>
                </div>
            

        </div>);
}

const Template = args =>  <Autosize width='800px' height='600px'> <ElevationGraph {...args} /></Autosize>;
const TemplateDiv = args => <Test {...args} />;

export const Default = Template.bind({});
Default.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
}

export const PropMaxPoints = Template.bind({});
PropMaxPoints.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    maxPoints: 32,
}

export const NotEnoughPoints = Template.bind({});
NotEnoughPoints.args = {
    routeData: sydney,
    width: '2000px',
    height: '600px',
}

export const WithMinValue = Template.bind({});
WithMinValue.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    minValue: true
}

export const WithReality = Template.bind({});
WithReality.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    pctReality: 50
}

export const WithPosition = Template.bind({});
WithPosition.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    position: 2250
}

export const WithPositionAndMarkers = Template.bind({});
WithPositionAndMarkers.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    position: 2250,
    markers: [ {routeDistance: 3000, avatar:{ shirt:'red'} } ]
}

export const WithPositionAndRange = Template.bind({});
WithPositionAndRange.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    position: 2250,
    range: 5000,
}
export const WithPositionAndRangeLapMode = Template.bind({});
WithPositionAndRangeLapMode.args = {
    routeData: sydney,
    width: '800px',
    height: '600px',
    position: 2250,
    range: 5000,
    lapMode: true
}

export const NoAxes = Template.bind({});
NoAxes.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    showXAxis: false,
    showYAxis: false,
}

export const ShowOnlyX = Template.bind({});
ShowOnlyX.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    showXAxis: true,
    showYAxis: false,
}

export const ShowOnlyY = Template.bind({});
ShowOnlyY.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    showXAxis: false,
    showYAxis: true,
}

export const ShowBothAxis = Template.bind({});
ShowBothAxis.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    showXAxis: true,
    showYAxis: true,
}

export const Imperial = Template.bind({});
Imperial.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    position: 16000,
    showXAxis: true,
    showYAxis: true,
    xScale: { value:1/1600, unit:'mi'},
    yScale: { value:3, unit:'ft'}
}

export const ImperialWithRange = Template.bind({});
ImperialWithRange.args = {
    routeData: testData,
    width: '800px',
    height: '600px',
    showXAxis: true,
    showYAxis: true,
    xScale: { value:1/1600, unit:'mi'},
    yScale: { value:3, unit:'ft'},
    position: 2250,
    range: 5000,

}

export const FullSize = Template.bind({});
FullSize.args = {
    routeData: testData,
    width: '100%',
    height: '100%'
}

export const WithinDiv = TemplateDiv.bind({});
WithinDiv.args = {
    routeData: testData,
}

export const NoData = Template.bind({});
NoData.args = {
    routeData: undefined,
    width: '800px',
    height: '600px'
}

export const EmptyData = Template.bind({});
EmptyData.args = {
    
    routeData: { decoded: [], distance: 0 },
    width: '800px',
    height: '600px'
}
