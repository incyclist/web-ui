import React from 'react';

import {RouteItem} from './index';


//const routeData = route.decoded
import sydney from '../../../../__tests__/testdata/sydney.json'

export default {
  component: RouteItem,
  title: 'Modules/Search/RouteItem',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <RouteItem {...args} />;

export const PreviewImg = Template.bind({});
PreviewImg.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    previewUrl:"https://cycling.vangestel.online/img/marburg_lahntal_preview.png",
    routeData:sydney,
    hasVideo:true,

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
    previewUrl:"https://cycling.vangestel.online/img/marburg_lahntal_preview.png",
    routeData:sydney,
    hasVideo:true,
    isDemo: true,
    ready :true

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
    previewUrl:"https://cycling.vangestel.online/img/marburg_lahntal_preview.png",
    routeData:sydney,
    hasVideo:true,
    isNew:true,
    ready :true

};

export const DemoNew = Template.bind({});
DemoNew.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    previewUrl:"https://cycling.vangestel.online/img/marburg_lahntal_preview.png",
    routeData:sydney,
    hasVideo:true,
    isNew:true,
    isDemo:true,
    ready :true

};


export const Map = Template.bind({});
Map.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    points:sydney.decoded,
    hasVideo:false,
    loaded:true,
    visible:true,
    ready :true
    
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
    loaded:true,
    visible:true,
    ready :true,
    state:'loading'
    
};

export const Imperial = Template.bind({});
Imperial.args = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance: { value:8.1 , unit:'mi' },
    elevation: { value:606 , unit:'ft' },
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    previewUrl:"https://cycling.vangestel.online/img/marburg_lahntal_preview.png",
    routeData:sydney,
    hasVideo:true,

    ready :true

};

