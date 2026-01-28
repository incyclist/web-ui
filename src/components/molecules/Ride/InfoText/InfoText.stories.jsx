import React from 'react';
import {InfoText} from './InfoText';


export default {
    component: InfoText,
    title: 'molecules/Ride/InfoText',
  };

const Template =  args => <InfoText {...args} />

export const Default = Template.bind({});
Default.args = {
    text: 'This is a default info text.',    
};

export const Multiline = Template.bind({});
Multiline.args = {
    text: 'This is a info text.\nIt has mutliple lines<br>Line #3',    
};

export const Timeout1s = Template.bind({});
Timeout1s.args = {
    text: 'This is a default info text.',    
    timeout:1000
};

const UpdateTest = () => {
    const [text, setText] = React.useState();
    const refDistance = React.useRef(0);

    const onClick  = () => {
        refDistance.current += 1000;
        const text = `This is an info text with distance: ${refDistance.current} m`;
        setText(text);
    };


    return <div> <InfoText text={text} routeDistance={refDistance.current} /> <button onClick={onClick}>Show Text</button> </div>;
}

const UpdateTemplate =  args => <UpdateTest {...args} />

export const Update = UpdateTemplate.bind({});
Update.args = {
};
