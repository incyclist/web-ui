import React from "react";
import { Row } from "../../../atoms";
import { DisplayTypeSelection } from "./index";

export default {
    component: DisplayTypeSelection,
    title: 'Molecules/Lists/DisplayTypeSelection',
    argTypes: { 
        onSelected: { action: 'selected' }
    },
    
  };
const Template = args => <Row background='grey'> <DisplayTypeSelection {...args} /></Row>


export const Default = Template.bind({});
Default.args = {   
}


export const ListSelected = Template.bind({});
ListSelected.args = {   
    selected: 'list'
}

export const TilesSelected = Template.bind({});
TilesSelected.args = {   
    selected: 'tiles'
}
