import React from 'react';

import {FoldableOverlayView} from './FoldableOverlay';

export default {
  component: FoldableOverlayView,
  title: 'molecules/FoldableOverlay',
  argTypes: { 
    onShow: { action: 'show' } ,
    onHide: { action: 'hide' } 
  },
};

const TemplateDark = args => <FoldableOverlayView {...args}><div >Hello</div></FoldableOverlayView> ;
const TemplateLight = args => <FoldableOverlayView {...args}><div style={{background:'white', width:'100%', height:'100%'}} >Hello</div></FoldableOverlayView> ;

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

export const Minimized = TemplateDark.bind({});
Minimized.args = {
    minimized:true,
    padding:0,
    border:''

};
