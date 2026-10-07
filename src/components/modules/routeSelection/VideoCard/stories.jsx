import React from 'react';

import {VideoCard} from './index';


//const routeData = route.decoded
import sydney from '../../../../__tests__/testdata/sydney.json'

export default {
  component: VideoCard,
  title: 'Modules/RouteSelection/Video',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <VideoCard {...args} />;

export const PreviewImg = Template.bind({});
PreviewImg.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    previewUrl: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
    routeData:sydney,
    height: 225,
    onOK: () => {},
    loaded:true,
    visible:true,
    ready :true

};


export const Video = Template.bind({});
Video.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    previewUrl: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
    routeData:sydney,
    height: 500,
    loaded:true,
    visible:true,
    ready :true
    
};

export const Demo = Template.bind({});
Demo.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    previewUrl: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
    routeData:sydney,
    height: 500,
    loaded:true,
    visible:true,
    ready :true,
    isDemo:true,
    initialized:true
    
};

export const New = Template.bind({});
New.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    previewUrl: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
    routeData:sydney,
    height: 500,
    loaded:true,
    visible:true,
    ready :true,
    isNew:true,
    initialized:true
    
};


export const CarouselNotInitialized = Template.bind({});
CarouselNotInitialized.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    routeData:sydney,
    height: 500,
    loaded:true,
    visible:true,
    ready :false
    
};

export const NotVisibleInCarousel = Template.bind({});
NotVisibleInCarousel.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    routeData:sydney,
    height: 500,
    loaded:true,
    visible:false,
    ready :true
    
};

export const LoadingDetails = Template.bind({});
LoadingDetails.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    
    routeData:sydney,
    height: 500,
    loaded:true,
    visible:true,
    ready :true,
    state:'loading'
    
};


export const IsNew = Template.bind({});
IsNew.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    previewUrl: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
    routeData:sydney,
    height: 500,
    loaded:true,
    visible:true,
    ready :true,
    isNew:true

};

export const WithActiveRides = Template.bind({});
WithActiveRides.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    previewUrl: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
    routeData:sydney,
    height: 500,
    loaded:true,
    visible:true,
    ready :true,
    cntActive:10

};

export const GPXRoute = Template.bind({});
GPXRoute.args = {
    id: 'gpx-1',
    title: 'Sydney Harbor Loop',
    country: 'au',
    distance: 24500,
    elevation: 340,
    category: 'GPX',
    hasVideo: false,
    shape: sydney?.decoded || [],
    height: 500,
    loaded: true,
    visible: true,
    ready: true,
    initialized: true
};

export const WithDeleteOption = Template.bind({});
WithDeleteOption.args = {
    id: 'del-1',
    title: 'Custom GPX Workout',
    country: 'fr',
    distance: 18400,
    elevation: 410,
    hasVideo: false,
    shape: sydney?.decoded || [],
    canDelete: true,
    onDelete: () => alert('Delete clicked'),
    height: 225,
    loaded: true,
    visible: true,
    ready: true,
    initialized: true
};
