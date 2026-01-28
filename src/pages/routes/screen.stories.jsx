import React   from 'react';
import { RoutesScreen } from './screen';
import Theme, { newUITheme } from '../../theme';

import {RouteImportCard} from 'incyclist-services'

Theme.add('newUITheme',newUITheme)
Theme.select('newUITheme')

export default {
    component: RoutesScreen,
    title: 'Modules/Routes/Routes Screen',   
    argTypes: { 
        onOK: { action: 'OK' },
        onRouteStart: {action: 'RouteStart'},
        onRouteDownload: {action: 'RouteDownload'},
    },
  };

const cardSize = {width:200, height:300}
const responsive = {
  0: {items:1},
  400: {items: 2},
  600: {items: 3},
  800: {items: 4}
}
const Template = args => <RoutesScreen {...args} width={800} height={600} cardSize={cardSize} responsive={responsive} />

const route= {
id: '1',
title: 'Arnbach' ,
country: 'de',
distance:11722,
elevation:201.9054766945829,    
provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
category:"Free",
videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
previewUrl: 'https://www.reallifevideo.de/pics/2024/rennbahn2_mittel.jpg',
loaded:true,
visible:true,
ready:true
}

export const Empty = Template.bind({});
Empty.args = {
    data:[]
}

export const Loading = Template.bind({});
Loading.args = {
  loading: true
}

const card1 = new RouteImportCard()

export const YourRoutes = Template.bind({});
YourRoutes.args = {
    data:[ {
        listHeader:'Your Routes',
        getId: ()=>'123',
        getTitle: ()=>'Your Routes',
        getCards: ()=> [card1],
        routes:[
          {type:'free-ride'},
          {type:'import'},
          {type:'route', ...route}
        ]
    }]

}




