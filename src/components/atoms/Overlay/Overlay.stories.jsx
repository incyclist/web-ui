import React from 'react';

import {Overlay} from './Overlay';

export default {
  component: Overlay,
  title: 'atoms/Overlay',
  argTypes: { onDrop: { action: 'dropped' } },
};

const Null = ()=>null

const TemplateDark = args => <Overlay {...args}><div >Hello</div></Overlay> ;
const TemplateLight = args => <Overlay {...args}><div style={{background:'white',color:'black', width:'100%', height:'100%'}} >Hello</div></Overlay> ;
const TemplateEmpty = args => <Overlay {...args}/> ;
const TemplateChildrenNull = args => <Overlay {...args}><Null/></Overlay> ;

export const Dark = TemplateDark.bind({});
Dark.args = {
    padding:0,
    border:''
};


export const Light = TemplateLight.bind({});
Light.args = {
    padding:0,
    border:''

};

export const Empty = TemplateEmpty.bind({});
Empty.args = {
    padding:0,
    border:''
};

export const EmptyWithHide = TemplateChildrenNull.bind({});
EmptyWithHide.args = {
    padding:0,
    border:'',
    hideEmpty:true
};
