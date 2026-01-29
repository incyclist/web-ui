import React from 'react';
import {CoachList} from './component';

export default {
  component: CoachList,
  title: 'Modules/Coaches/List',
};

const DefaultCoaches = [ 
  { name:'Power ', type:'power',power:200},  
  { name:'Speed', type:'speed', speed: 30},
  { name:'With Lead', type:'power', power:220, lead:500},  
]

const ImperialCoaches = [ 
  { name:'Power ', type:'power',power:200},  
  { name:'Speed', type:'speed', speed: { value:20, unit:'mph'}},
  { name:'With Lead', type:'power', power:220, lead:{ value:200, unit:'yd'}},  
]


const Template = args => <div style={{width:'600px', height:'400px', background:'black'}}><CoachList {...args} /></div>

export const Default = Template.bind({});
Default.args = {
    coaches: DefaultCoaches,
    rows:5,   
}

export const Imperial = Template.bind({});
Imperial.args = {
    coaches: ImperialCoaches,
    rows:5,
   
}
