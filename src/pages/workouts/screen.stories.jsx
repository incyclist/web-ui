import React   from 'react';
import { WorkoutsScreen } from './screen';
import { WorkoutCreateCard, WorkoutImportCard } from 'incyclist-services';
import { CardList } from 'incyclist-services';

export default {
    component: WorkoutsScreen,
    title: 'Pages/Workouts',   
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
const Template = args => <WorkoutsScreen {...args} width={800} height={600} cardSize={cardSize} responsive={responsive} />

const myWorkouts = new CardList('myWorkouts','My Workouts')
myWorkouts.add(new WorkoutImportCard())
myWorkouts.add(new WorkoutCreateCard())

export const Default = Template.bind({});
Default.args = {
    data:[
      myWorkouts
    ]
}

export const Empty = Template.bind({});
Empty.args = {
    data:[]
}
