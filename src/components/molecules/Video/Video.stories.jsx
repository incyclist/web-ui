import React from 'react';
import {Video} from './Video';
import EventEmitter from 'events'



export default {
  component: Video,
  title: 'Molecules/Video',
  argTypes: { 
    onLoaded: { action: 'loaded' } ,
    onPlaybackUpdate: { action: 'update' } ,
    onLoadError: { action: 'load error' },    
    onPlaybackError: { action: 'playback error' },
    onStalled: { action: 'stalled' }


},
};

const Template = args => <Video {...args} />;


export const Default = Template.bind({});
Default.args = {
    src: 'https://www.reallifevideo.eu/stream/DE_Arnbach.mp4',
    width:320,
    height:200,  

};

export const NoSize = Template.bind({});
NoSize.args = {
    src: 'https://www.reallifevideo.eu/stream/DE_Arnbach.mp4',
};

export const Size100Pct = Template.bind({});
Size100Pct.args = {
    src: 'https://www.reallifevideo.eu/stream/DE_Arnbach.mp4',
    width:'100%',
    height:'100%',
};


export const StartTime = Template.bind({});
StartTime.args = {
    src: 'https://www.reallifevideo.eu/stream/DE_Arnbach.mp4',
    width:320,
    height:200,  
    startTime:10

};

const WithButtons = args => {
    const observer = new EventEmitter()

    observer.stop = ()=> {
        observer.removeAllListeners()
    }

    const start = ()=> {
        observer.emit('rate-update', 1)
        setTimeout(() => {
            observer.emit('rate-update', 0) 
        },5000)

    }


    return  <div>
        <Video {...args} observer={observer} />
        <button onClick={start}>Play</button>
    </div>
}


export const Play5s = WithButtons.bind({});
Play5s.args = {
    src: 'https://www.reallifevideo.eu/stream/DE_Arnbach.mp4',
    width:320,
    height:200,    
};


export const Hidden = Template.bind({});
Hidden.args = {
    src: 'https://www.reallifevideo.eu/stream/DE_Arnbach.mp4',
    width:320,
    height:200,  
    hidden: true

};
