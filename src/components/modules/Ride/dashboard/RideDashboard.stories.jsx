import React from 'react';
import {RideDashboard} from './RideDashboard';
import {Overlay} from '../../../atoms';

export default {
    component: RideDashboard,
    title: 'modules/ride/RideDashboard',
    
  };
const Template = args => <div  style={{ backgroundColor:'red', width:'100%', height:'100%'}}><Overlay padding='0' margin='0' top='0' height='10vh' left='25vw' width='50vw'> <RideDashboard {...args} /></Overlay></div>


const items = [
  { title:'Time', data:{value:'0:10:01'}},
  { title:'Distance', data:{value:'1.8',unit:'km'}},
  { title:'Speed', data:{value:'31.2',unit:'km/h'}},
  { title:'Power', data:{value:'152',unit:'W'}},
  { title:'Slope', data:{value:'1.5',unit:'%'}},
  { title:'Heartrate', data:{value:'112',unit:'bpm'},dataState:'amber'},
  { title:'Cadence', data:{value:'82',unit:'rpm'}},
]

const itemsPowerDouble = [
  { title:'Time', data:{value:'0:10:01'}},
  { title:'Distance', data:{value:'1.8',unit:'km'}},
  { title:'Speed', data:{value:'31.2',unit:'km/h'}},
  { title:'Power', size:2,data:{value:'152',unit:'W'}},
  { title:'Heartrate', data:{value:'112',unit:'bpm'}},
  { title:'Cadence', data:{value:'82',unit:'rpm'}},
]

const items2 = [
  { title:'Time', data:[{value:'0:10:01'},{value:'-0:49:59'}]},
  { title:'Distance', data:[{value:'1.8',unit:'km'},{value:'-9.2'}]},
  { title:'Speed', data:[{value:'31.2',unit:'km/h'},{value:'55.0', label:'max'}]},
  { title:'Power', data:[{value:'152',unit:'W'},{value:'170',label:'avg'}]},
  { title:'Slope', data:[{value:'1.5',unit:'%'},{value:'7',label:'gain',unit:'m'}]},
  { title:'Heartrate', data:[{value:'112',unit:'bpm'},{value:'99', label:'avg'}]},
  { title:'Cadence', data:[{value:'82',unit:'rpm'},{value:'89',label:'avg'}]},
]

const items2RF = [
  { title:'Time', data:[{value:'0:10:01'},{value:'-0:49:59'}]},
  { title:'Distance', data:[{value:'1.8',unit:'km'},{value:'-9.2'}]},
  { title:'Speed', data:[{value:'31.2',unit:'km/h'},{value:'55.0', label:'max'}]},
  { title:'Power', data:[{value:'152',unit:'W'},{value:'170',label:'avg'}]},
  { title:'Slope', data:[{value:'11.5',unit:'%',info:'50% RF'},{value:'7',label:'gain',unit:'m'}]},
  { title:'Heartrate', data:[{value:'112',unit:'bpm'},{value:'99', label:'avg'}]},
  { title:'Cadence', data:[{value:'82',unit:'rpm'},{value:'89',label:'avg'}]},
]

const itemsNoHrm = [
  { title:'Time', data:[{value:'0:10:01'},{value:'-0:49:59'}]},
  { title:'Distance', data:[{value:'1.8',unit:'km'},{value:'-9.2'}]},
  { title:'Speed', data:[{value:'31.2',unit:'km/h'},{value:'55.0', label:'max'}]},
  { title:'Power', data:[{value:'152',unit:'W'},{value:'170',label:'avg'}]},
  { title:'Slope', data:[{value:'1.5',unit:'%'},{value:'7',label:'gain',unit:'m'}]},
  { title:'Heartrate', data:[{value:undefined,unit:'bpm'},{value:'99', label:'avg'}]},
  { title:'Cadence', data:[{value:'82',unit:'rpm'},{value:'89',label:'avg'}]},
]

export const Default = Template.bind({});
Default.args = {
    items,
    rows:1,
    showHeader:true
}

export const LargeColumn = Template.bind({});
LargeColumn.args = {
    items:itemsPowerDouble,
    rows:1,
    showHeader:true
}

export const NoHrm = Template.bind({});
NoHrm.args = {
  items:itemsNoHrm,
  rows:2,
  showHeader:true
}

export const NoHeader = Template.bind({});
NoHeader.args = {
  items,
  rows:1,
  showHeader:false
}

export const Dark = Template.bind({});
Dark.args = {
  items,
  rows:1,
  showHeader:true,
  scheme:'dark'
}

export const TwoRows = Template.bind({});
TwoRows.args = {
  items:items2,
  rows:2,
  showHeader:true
}

export const TwoRowsRealityFactor = Template.bind({});
TwoRowsRealityFactor.args = {
  items:items2RF,
  rows:2,
  showHeader:true
}

export const TwoRowDataOneRowProp = Template.bind({});
TwoRowDataOneRowProp.args = {
  items:items2,
  rows:1,
  showHeader:true
}

export const TwoRowsNoHeader = Template.bind({});
TwoRowsNoHeader.args = {
  items:items2,
  rows:2,
  showHeader:false
}

const itemsWithGear = [...items2,{ title:'Gear', data:[{value:'+1',unit:''}]}]
export const TwoRowsWithGear = Template.bind({});
TwoRowsWithGear.args = {
  items:itemsWithGear,
  rows:2,
  showHeader:true
}


