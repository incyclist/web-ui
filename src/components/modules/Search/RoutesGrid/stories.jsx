import React   from 'react';
import { RoutesGrid } from './index';
import AppTheme from '../../../../theme';


AppTheme.select('default')

export default {
    component: RoutesGrid,
    title: 'Modules/Search/RoutesGrid',   
    argTypes: { 
        onSelect: {action: 'Select'},
        onDelete: {action: 'Delete'},
    },
  };


const Template = args => <RoutesGrid {...args} width={800} height={600}  />

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
  points:[
    { routeDistance:0, elevation:10},
    { routeDistance:1, elevation:11},
    { routeDistance:2, elevation:12},
    { routeDistance:3, elevation:11},
    { routeDistance:4, elevation:10},
  ]
}

const createTestData =(cnt) => {
  const data =[]
  for (let i=1;i<10;i++) {
    const r = {...route}
    r.country = ['de','fr','us','au','nl'][Math.ceil(Math.random()*4)]
    r.title = r.title + ` ${i}`
    r.distance = Math.random()*120000
    r.elevation = Math.random()*0.02 * r.distance
    r.id = i
    data.push(r)
  }  
  return data
}



export const Empty = Template.bind({});
Empty.args = {
    routes:[]
}

export const WithRoutes = Template.bind({});
WithRoutes.args = {    
    routes: createTestData(10)
}
