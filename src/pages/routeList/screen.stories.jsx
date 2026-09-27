import React   from 'react';
import { RouteListScreen } from './screen';


export default {
    component: RouteListScreen,
    title: 'Pages/RouteList',
    argTypes: {
        onFreeRide: {action: 'FreeRide'},
        onImportRoutes: {action: 'ImportRoutes'},
        onToggleFilters: {action: 'ToggleFilters'},
        onSortOrderChanged: {action: 'SortOrderChanged'},
    },
  };


const Template = args => <RouteListScreen {...args} />

const route= {
  id: '1',
  title: 'Arnbach' ,
  country: 'de',
  distance:11722,
  elevation:201.9054766945829,
  hasVideo: true,
  ready: true,
  videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
  previewUrl: 'https://www.reallifevideo.de/pics/2024/rennbahn2_mittel.jpg',
}

const createTestData =(cnt) => {
  const data =[]
  for (let i=1;i<=cnt;i++) {
    const r = {...route}
    r.id = `${i}`
    r.title = r.title + ` ${i}`
    r.distance = Math.round(i*7919 % 120000)
    r.elevation = Math.round(0.02 * r.distance)
    data.push(r)
  }
  return data
}

const common = {
  displayType:'list', sortOrder:'suggested', units:{distance:'km', elevation:'m'},
  countries:['France','Germany'], contentTypes:['Video','GPX'], routeTypes:['Loop','Point to Point'], routeSources:['Local','Incyclist'],
}

export const Loading = Template.bind({});
Loading.args = {
  ...common,
  loading: true
}

export const EmptyLibrary = Template.bind({});
EmptyLibrary.args = {
  ...common,
  routes:[], cards:[], filters:{}, totalCount:0, countText:'0 routes'
}

export const NoMatch = Template.bind({});
NoMatch.args = {
  ...common,
  routes:[], cards:[], totalCount:1247, countText:'0 of 1 247 routes',
  filters:{title:'Ventoux', country:'France', contentType:'Video'},
  noMatchHint:'Try removing a filter — 3 routes match “Ventoux” on its own.'
}

export const WithRoutes = Template.bind({});
WithRoutes.args = {
  ...common,
  routes: createTestData(20), filters:{}, totalCount:20, countText:'20 routes'
}

export const FiltersOpen = Template.bind({});
FiltersOpen.args = {
  ...common,
  routes: createTestData(5), totalCount:20, countText:'5 of 20 routes',
  filters:{contentType:'Video', country:'France', distance:{min:{value:40,unit:'km'}}},
  filtersExpanded: true
}
