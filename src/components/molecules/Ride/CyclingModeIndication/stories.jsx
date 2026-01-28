import React, { useEffect, useState } from 'react';
import {CyclingModeIndication} from './index';


export default {
    component: CyclingModeIndication,
    title: 'molecules/Ride/ModeIndication', 
    argTypes: { onHidden: { action: 'hidden' } },
  };
  

const Template =  args => <CyclingModeIndication {...args} />



export const Default = Template.bind({});
Default.args = {
    mode:'SIM',
    delay: 3000
}


const TwoMessagesTest = (props)=> {

    const [args,setArgs] = useState( props)
    const [initialized, setInitialized] = useState(false)
    useEffect( ()=>{
        if (initialized)
            return;
        setInitialized(true)
        setTimeout( ()=>{ 
            setArgs( prev=> ({...prev, mode:'ERG'})) 
            }, 1500)
    }, [initialized])

    return <CyclingModeIndication {...args} />
}


const TwoMessagesTemplate =  args => <TwoMessagesTest {...args} />



export const TwoMessages = TwoMessagesTemplate.bind({});
TwoMessages.args = {
    mode:'SIM',
    delay: 3000
}
