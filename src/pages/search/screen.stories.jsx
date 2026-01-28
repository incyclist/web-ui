import React   from 'react';
import { SearchScreen } from './screen';


export default {
    component: SearchScreen,
    title: 'Pages/Search',   
    argTypes: { 
        onRouteStart: {action: 'RouteStart'},
    },
  };


const Template = args => <SearchScreen {...args} width={800} height={600}  />

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
}

const createTestData =(cnt) => {
  const data =[]
  for (let i=1;i<10;i++) {
    const r = {...route}
    r.country = ['de','uk','us','au'][Math.round(Math.random()*4)]
    r.title = r.title + ` ${i}`
    r.distance = Math.random()*120000
    r.elevation = Math.random()*0.02 * r.distance
    data.push(r)
  }  
  return data
}



export const Empty = Template.bind({});
Empty.args = {
    data:[]
}

export const Loading = Template.bind({});
Loading.args = {
  loading: true
}

export const WithRoutes = Template.bind({});
WithRoutes.args = {    
    filter:{},
    routes: createTestData(10)
}




