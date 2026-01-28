import React from 'react';
import {Table} from './Table';

export default {
  component: Table,
  title: 'molecules/Table',
  argTypes: { onClick: { action: 'clicked' }, onSelected: {action:'selected'} },
};

const Template = args => <Table {...args} />;

export const Default = Template.bind({});
Default.args = {
  onDelete:null,
  onEdit:null,
  headers: ['Title', 'Distance', 'Elevation'],
  rows:10,
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[v=>v,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right'],
    width:['60%','20%','20%']
  },
  data:[
    {title:'A very long route title XX YY ZZ',distance:100,elevation:200},    
    {title:'B',distance:200,elevation:300},
    {title:'C',distance:300,elevation:400},
    {title:'D',distance:400,elevation:500},
  ]
};

export const Scrollable = Template.bind({});
Scrollable.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  rows: 10,
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[v=>v,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right'],
    width:['60%','20%','20%']
  },
  data:[
    {title:'A very long route title XX YY ZZ',distance:100,elevation:200},
    
    {title:'B',distance:200,elevation:300},
    {title:'C',distance:300,elevation:400},
    {title:'D',distance:400,elevation:500},
    {title:'E',distance:500,elevation:600},
    {title:'F',distance:600,elevation:700},
    {title:'G',distance:700,elevation:800},
    {title:'H',distance:800,elevation:900},
    {title:'I',distance:900,elevation:1000},
    {title:'J',distance:1000,elevation:1100},
    {title:'K',distance:1100,elevation:1200},
    {title:'L',distance:1200,elevation:1300},
    {title:'M',distance:1300,elevation:1400},
    {title:'N',distance:1400,elevation:1500},
    {title:'O',distance:1500,elevation:1600},
    {title:'P',distance:1600,elevation:1700},
    {title:'Q',distance:1700,elevation:1800}
    

  ]
};

export const ScrollableSelected = Template.bind({});
ScrollableSelected.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  selected:14,
  rows: 10,
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[v=>v,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right'],
    width:['60%','20%','20%']
  },
  data:[
    {title:'A very long route title XX YY ZZ',distance:100,elevation:200},
    
    {title:'B',distance:200,elevation:300},
    {title:'C',distance:300,elevation:400},
    {title:'D',distance:400,elevation:500},
    {title:'E',distance:500,elevation:600},
    {title:'F',distance:600,elevation:700},
    {title:'G',distance:700,elevation:800},
    {title:'H',distance:800,elevation:900},
    {title:'I',distance:900,elevation:1000},
    {title:'J',distance:1000,elevation:1100},
    {title:'K',distance:1100,elevation:1200},
    {title:'L',distance:1200,elevation:1300},
    {title:'M',distance:1300,elevation:1400},
    {title:'N',distance:1400,elevation:1500},
    {title:'O',distance:1500,elevation:1600},
    {title:'P',distance:1600,elevation:1700},
    {title:'Q',distance:1700,elevation:1800}
    

  ]
};

export const Empty = Template.bind({});
Empty.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  selected:14,
  rows: 10,
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[v=>v,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right'],
    width:['60%','20%','20%']
    
  },
  data:[ ]
};


export const Single = Template.bind({});
Single.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  selected:14,
  rows: 1,
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[v=>v,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right'],
    width:['60%','20%','20%']
  },
  data:[{title:'',distance:100,elevation:200}]
};


export const NoWidth = Template.bind({});
NoWidth.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  rows:10,
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[v=>v,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right']
    
  },
  data:[
    {title:'A very long route title XX YY ZZ',distance:100,elevation:200},    
    {title:'B',distance:200,elevation:300},
    {title:'C',distance:300,elevation:400},
    {title:'D',distance:400,elevation:500},
  ]
};


export const NoWidthSrollable = Template.bind({});
NoWidthSrollable.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  rows:4,
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[v=>v,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right']
    
  },
  data:[
    {title:'A very long route title XX YY ZZ',distance:100,elevation:200},    
    {title:'B',distance:200,elevation:300},
    {title:'C',distance:300,elevation:400},
    {title:'D',distance:400,elevation:500},
    {title:'E',distance:400,elevation:500},
    {title:'F',distance:400,elevation:500},
    {title:'G',distance:400,elevation:500},
  ]
};

export const NoRows = Template.bind({});
NoRows.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[v=>v,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right']
    
  },
  data:[
    {title:'A very long route title XX YY ZZ',distance:100,elevation:200},    
    {title:'B',distance:200,elevation:300},
    {title:'C',distance:300,elevation:400},
    {title:'D',distance:400,elevation:500},
    {title:'E',distance:400,elevation:500},
    {title:'F',distance:400,elevation:500},
    {title:'G',distance:400,elevation:500},
  ]
};


const CategoryData = [
  {id:'4711',title:'A',distance:100,elevation:200},    
  {id:'4712',title:'B',category:'catA',distance:200,elevation:300},
  {id:'4713',title:'C',category:'catA',distance:300,elevation:400},
  {title:'D',category:'catA',distance:400,elevation:500},
  {title:'E',category:'catB',distance:500,elevation:600},
  {title:'F',category:'catC',distance:600,elevation:700},
  {title:'G',category:'catB',distance:700,elevation:800},
  {title:'H',category:'catC',distance:800,elevation:900},
  {title:'I',category:'catD',distance:900,elevation:1000},
  {title:'J',category:'catE',distance:1000,elevation:1100},
  {title:'K',category:'catF',distance:1100,elevation:1200},
  {title:'L',category:'catF',distance:1200,elevation:1300},
  {title:'M',category:'catA',distance:1300,elevation:1400},
  {title:'N',category:'catB',distance:1400,elevation:1500},
  {title:'O',category:'catC',distance:1500,elevation:1600},
  {title:'P',category:'catD',distance:1600,elevation:1700},
  {title:'Q',category:'catF',distance:1700,elevation:1800}
  

]

export const Categories = Template.bind({});
Categories.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  categories: 'category',
  rows: 10,
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[undefined,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right'],
    width:['60%','20%','20%']
  },
  data:CategoryData
};

export const CategoriesAllUnfolded = Template.bind({});
CategoriesAllUnfolded.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  categories: 'category',
  rows: 10,
  unfolded: true,
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[undefined,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right'],
    width:['60%','20%','20%']
  },
  data:CategoryData
};

export const CategoriesSingelUnfolded = Template.bind({});
CategoriesSingelUnfolded.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  categories: 'category',
  rows: 10,
  unfoldedCategories: 'catB',
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[undefined,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right'],
    width:['60%','20%','20%']
  },
  data:CategoryData
};


export const CategoriesMultipleUnfolded = Template.bind({});
CategoriesMultipleUnfolded.args = {
  headers: ['Title', 'Distance', 'Elevation'],
  categories: 'category',
  rows: 10,
  unfoldedCategories: ['catA','catB'],
  columns: 
  {
    fields:['title','distance','elevation'],
    format:[undefined,v=>`${Number(v/1000).toFixed(1)} km`,v=>`${Math.round(v)}m`] ,
    align:['left','right','right'],
    width:['60%','20%','20%']
  },
  data:CategoryData
};
