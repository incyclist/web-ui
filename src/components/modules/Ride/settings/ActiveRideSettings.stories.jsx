import React from 'react';
import {Workout} from 'incyclist-services';
import { EventLogger,ConsoleAdapter } from 'gd-eventlog';
import { ActiveRideSettings } from './ActiveRideSettings';

const POWER_TYPE = {
  WATT : 'watt',
  PCT: 'pct of FTP'
}

export default {
  component: ActiveRideSettings,
  title: 'modules/ride/RideSettings',
  argTypes: { onSettingsChanged: { action: 'changed' } },
};



const Template = args => <ActiveRideSettings {...args} />;

//ActiveRideSettings.prototype.updateSettings = ()=>{}
EventLogger.registerAdapter(new ConsoleAdapter({depth:1}))

export const Default = Template.bind({});
Default.args = {
  area:'User'
}

export const Video = Template.bind({});
Video.args = {
  area: 'User',
  routeOptions: { rideMode:'video'}
}

/* TODO: move into subfolder 
export const GearDaumClassic = Template.bind({});
const DaumClassicOptions = [
 {
    getName:()=>'ERG', 
    getDescription:()=>'Calculates speed based on power and slope. Power is calculated from gear and cadence',
    getProperties:()=>[
      {key:'bikeType',name: 'Bike Type', description: '', type: CyclingModeProperyType.SingleSelect, options:['Race','Mountain','Triathlon'], default: 'Race'},
      {key:'startPower',name: 'Starting Power', description: 'Initial power in Watts at start of raining', type: CyclingModeProperyType.Integer, default: 50, min:25, max:800},
      {key:'simulation',name: 'Simulate ', description: 'Simulate ', type: CyclingModeProperyType.Boolean, default: false},
      {key:'chainRings',name: 'Chain Rings', description: 'Simulated chain rings (format: <min>-<max>)', type: CyclingModeProperyType.String, default:'36-52', size:5, regex:'^[0-9]{0,2}-{0,1}[0-9]{0,2}$', validation:(v)=> { console.log('~~ validate',v); return /^[0-9]{1,2}-[0-9]{1,2}$/.test(v) } , condition:(s)=>s.simulation===true},
      {key:'cassetteRings',name: 'Cassette', description: 'Simulated cassette (format: <min>-<max>)', type: CyclingModeProperyType.String,  default:'11-30', size:5,regex:'', validation:(v)=>true, condition:(s)=>s.simulation===true},
  ]
  }, 
  {
    getName:()=>'SmartTrainer', 
    getDescription:()=>'Calculates speed based on power and slope. Power is calculated from gear and cadence',
    getProperties:()=> [
      {key:'bikeType',name: 'Bike Type', description: '', type: CyclingModeProperyType.SingleSelect, options:['Race','Mountain','Triathlon'], default: 'Race'},
      {key:'startPower',name: 'Starting Power', description: 'Initial power in Watts at start of raining', type: CyclingModeProperyType.Integer, default: 50, min:25, max:800},
      {key:'minPower',name: 'Minimum Power', description: 'Minimum power in declines', type: CyclingModeProperyType.Integer, default: 50, min:25, max:800},
      {key:'simulation',name: 'Simulate ', description: 'Simulate ', type: CyclingModeProperyType.Boolean, default: false},
      {key:'chainRings',name: 'Chain Rings', description: 'Simulated chain rings (format: <min>-<max>)', type: CyclingModeProperyType.String, default:'36-52', size:5, regex:'^[0-9]{0,2}-{0,1}[0-9]{0,2}$', validation:(v)=> { console.log('~~ validate',v); return /^[0-9]{1,2}-[0-9]{1,2}$/.test(v) } , condition:(s)=>s.simulation===true},
      {key:'cassetteRings',name: 'Cassette', description: 'Simulated cassette (format: <min>-<max>)', type: CyclingModeProperyType.String,  default:'11-30', size:5,regex:'', validation:(v)=>true, condition:(s)=>s.simulation===true},
  ]
  }, 
  {
    getName:()=>'PowerMeter', 
    getDescription:()=>'power and cadence are taken from device. Speed is calculated from power and current slope',
    getProperties:()=> [{key:'slope',name: 'Slope', description: 'slope (%) to simulate', type: CyclingModeProperyType.Float, default: 0, min:-10, max:10},] 
  }, 
]
GearDaumClassic.args = {
  area: {selected: 'Gear'},
  gearOptions: { device:{}, settings:{startPower:100}, mode: DaumClassicOptions[0], options:DaumClassicOptions},
}



export const GearSimultor = Template.bind({});
const SimulatorOptions = [
 {
    getName:()=>'Simulator', 
    getDescription:()=>'Simulates a ride with constant speed or power output',
    getProperties:()=>[
      {key:'mode',name: 'Simulation Type', description: '', type: CyclingModeProperyType.SingleSelect, options:['Speed','Power'], default: 'Power'},
      {key:'delay',name: 'Start Delay', description: 'Delay (in s) at start of training', type: CyclingModeProperyType.Integer, default: 2, min:0, max:30},
      {key:'power',name: 'Power', description: 'Power (in W) at start of training', condition: (s)=> !s.mode || s.mode==='Power', type: CyclingModeProperyType.Integer, default: 150, min:25, max:800},
      {key:'speed',name: 'Speed', description: 'Speed (in km/h) at start of training', condition: (s)=> s.mode==='Speed', type: CyclingModeProperyType.Integer, default: 30, min:5, max:50},
  ]
} 
]
GearSimultor.args = {
  area: {selected: 'Gear'},
  gearOptions: { device:{}, settings:{}, mode: SimulatorOptions[0], options:SimulatorOptions},
}

*/

let workout = {name:'Test Workout',
steps: [
  { duration: 20, power:{min:80, max:100,type:POWER_TYPE.PCT}, steady:true, work:true } ,
  { duration: 20, power:{min:100, max:120,type:POWER_TYPE.PCT}, steady:true, work:true } ,
  { duration: 20, power:{min:120, max:140,type:POWER_TYPE.PCT}, steady:true, work:true } 
]
}
let wo = new Workout(workout);



export const WorkoutEmpty = Template.bind({})
WorkoutEmpty.args = {
  area: {selected: 'Workout'},
  workoutOptions: { },
}


