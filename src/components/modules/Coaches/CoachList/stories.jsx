import React from 'react';
import {CoachList} from './component';

export default {
  component: CoachList,
  title: 'Coaches/List',
};
 
const Template = args => <div style={{width:'600px', height:'400px', background:'black'}}><CoachList {...args} /></div>

export const Default = Template.bind({});

const DefaultCoaches = [ 
  { name:'Power ', type:'power',power:200},  
  { name:'Speed', type:'speed', speed: 30},
  { name:'With Lead', type:'power', power:220, lead:500},  
]



Default.args = {
    coaches: DefaultCoaches,
    rows:5,
   
}
