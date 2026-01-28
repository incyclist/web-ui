import { AppThemeProvider } from '../../../../theme';
import { Dialog, Tabs } from '../../../molecules';
import {ActivitySummaryView} from './ActivitySummary'
import React from 'react'


export default {
    component: ActivitySummaryView,
    title: 'modules/ride/Summary',
    
  };


const Template = args => 
    <AppThemeProvider>
        
        <Dialog id='RideOptions' className='dialog' level={1} width='800px' >
            <Tabs>
                <ActivitySummaryView {...args} label='Activity'/>
            </Tabs>
        </Dialog>
    </AppThemeProvider>

const activity = {
    title:'Test',
    distance: 1000,
    time: 100,
    fitFileName:'test.fit',

    logs:[
        {
            "time": 1.003,
            "timeDelta": 1.003,
            "speed": 3.9350486655186363,
            "cadence": 0,
            "heartrate": 66,
            "power": 29,
            "distance": 32.281608955214324,
            "slope": 4.877275366583262,
            "elevation": 643.7572542314305,
            "lat": 59.40020472097145,
            "lng": 6.50756410525089
        },
        {
            "time": 2.003,
            "timeDelta": 1.0000000000000002,
            "speed": 6.761711868069305,
            "cadence": 0,
            "heartrate": 66,
            "power": 127,
            "distance": 34.15986225190136,
            "slope": 4.877275366583262,
            "elevation": 643.8480510818492,
            "lat": 59.40020622002134,
            "lng": 6.507597120470053
        },
        {
            "time": 3.003,
            "timeDelta": 1,
            "speed": 7.6709174053497415,
            "cadence": 0,
            "heartrate": 65,
            "power": 117,
            "distance": 36.29067264227342,
            "slope": 4.877275366583262,
            "elevation": 643.9510568226759,
            "lat": 59.40020792063918,
            "lng": 6.507634575041359
        },
        {
            "time": 4.003,
            "timeDelta": 1,
            "speed": 8.593515708755378,
            "cadence": 74,
            "heartrate": 65,
            "power": 127,
            "distance": 38.54962168589918,
            "slope": 4.877275366583262,
            "elevation": 644.0602569283163,
            "lat": 59.40020972352558,
            "lng": 6.507674281984977
        },
        {
            "time": 5.003,
            "timeDelta": 1,
            "speed": 8.593515708755378,
            "cadence": 74,
            "heartrate": 65,
            "power": 127,
            "distance": 40.936709382778645,
            "slope": 5.328975494973065,
            "elevation": 644.1760557228461,
            "lat": 59.40021137310523,
            "lng": 6.50772332699376
        }

    ],

    stats:{
        power:{min:90, max:200, avg:150, weighted:170},
        hrm:{min:90, max:140, avg:110},
        cadence:{min:70, max:90, avg:80},
        speed:{min:10, max:40, avg:36},
    }

}

const imperial = { ...activity}
imperial.distance = {value:'123', unit:'mi'}
imperial.stats.speed = { 
    min: {value:6.1, unit:'mph'},
    max: {value:24.5, unit:'mph'},
    avg: {value:21.5, unit:'mph'},
}

export const Default = Template.bind({});
Default.args = {
    activity,
    showMap:true,
    showSave: true       
}

export const Imperial = Template.bind({});
Imperial.args = {
    activity:imperial,
    showMap:true,
    showSave: true,
    units: {
        distance: 'mi',
        speed:'mph'
    },
    xScale: 1/1600
}

export const TitleEditable = Template.bind({});
TitleEditable.args = {
    activity,
    showMap:true,
    showSave: true,
    onTitleChange: ()=>{}
}

export const WithFit = Template.bind({});
WithFit.args = {
    activity,
    showMap:true,
    showSave: true,
    
}

export const Saving = Template.bind({});
Saving.args = {
    activity,
    showMap:true,
    showSave: true,
    isSaving:true,
}


export const NoGPX = Template.bind({});
const noGPXActivity = {...activity}
noGPXActivity.logs = []
activity.logs.forEach( al=> { 
    const l = {...al}
    delete l.lat
    delete l.lng
    noGPXActivity.logs.push(l)
})

NoGPX.args = {
    activity:noGPXActivity,
    showMap: false,    
    showSave: true,
    preview: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
}

const noHrmActivity = {...activity}
noHrmActivity.logs.forEach( r=> {delete r.heartrate})

export const NoHrm = Template.bind({});
NoHrm.args = {
    activity:noHrmActivity,
    showMap: false,    
    showSave: true,
    preview: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
}

export const WithDonate = Template.bind({});
WithDonate.args = {
    activity:noHrmActivity,
    showMap: false,    
    showSave: true,
    showDonate: true,
    onDonate: () => {},
    preview: 'https://videos.incyclist.com/previews/DE_Arnbach_preview.png',
}
