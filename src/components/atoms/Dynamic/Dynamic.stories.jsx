import React from 'react';
import EventEmitter from 'events';
import {Dynamic} from './index';

export default {
  component: Dynamic,
  title: 'Atoms/Dynamic',
  argTypes: { onEvent: { action: 'event' } },
};


const Text = ({text }) => {
    return <div>{text}</div>
}

class Observer extends EventEmitter {

    constructor( ) {
        super();

        this.iv = setInterval(()=>{
            this.emit('data',(Math.floor(Date.now()/1000)) % 60)            
            if ((Math.floor(Date.now()/1000)) % 60===0)
                this.emit('update','X')
        }, 1000)
        
    }
    stop() {
        this.removeAllListeners()
        if (this.iv) {
            clearInterval(this.iv)
            this.iv = undefined;
        }
    }
}

const Template = args => <Dynamic {...args} observer={ new Observer()}><Text/></Dynamic>

export const Mapping = Template.bind({});
Mapping.args = {
    mapping: [
        {event:'data', prop:'text'}
    ]
};

export const EventAndProp = Template.bind({});
EventAndProp.args = {
    event:'data', 
    prop:'text'
};

export const EventAndCallback = Template.bind({});
EventAndCallback.args = {
    event:'data', 
};

export const EventsAndProp = Template.bind({});
EventsAndProp.args = {
    events:'data,update', 
    prop:'text'
};

export const Transform = Template.bind({});
Transform.args = {
    event:'data', 
    prop:'text',
    transform: (v)=>`Seconds: ${v}`
};
