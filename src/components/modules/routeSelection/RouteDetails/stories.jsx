import React from 'react';

import {RouteDetails} from './component';


//const routeData = route.decoded
import sydney from '../../../../__tests__/testdata/sydney.json'
import { Route } from 'incyclist-services/lib/routes/base/model/route';

export default {
  component: RouteDetails,
  title: 'Modules/RouteSelection/RouteDetails',
  argTypes: { 
    onStart: { action: 'start' } , 
    onCancel: { action: 'cancel' }},
    onAddWorkout: { action: 'addWorkout'}
};

const Template = args => <RouteDetails {...args} />;

const routeDescr = {
    id: '1',
    title: 'Arnbach' ,
    country: 'de',
    distance:11722,
    elevation:201.9054766945829,    
    provider:{name:"RealLifeVideo",url:"https://www.reallifevideo.de/index.php",logo:"https://videos.incyclist.com/reallifevideo.svg"},
    category:"Free",
    videoUrl:"https://www.reallifevideo.eu/stream/DE_Arnbach.mp4",
    videoFormat: 'mp4',
    isLoop: true,
    previewUrl: 'https://www.reallifevideo.de/pics/2024/rennbahn2_mittel.jpg',
    points:sydney.decoded,
    hasGpx:true,
    height: 500,
    loaded:true,
    isLocal:true,
    hasVideo:true
}

const gpxDescr = {
    id: "5c7a6ae31b1bef04c5854cb3",
    title: "Sydney Opera House and Botanic Garden",
    distance: 3801.452188724582,
    elevation: 35.19111323845895,
    originalName: "Sydney Opera House and Botanic Garden",
    hasVideo: false,
    hasGpx: true,
    isLocal: false,
    points:sydney.decoded,
}

const segments = [
    { name:'Total Trip', start:0, end:11720},
    { name:'First km', start:0, end:1000},
    { name:'Last km', start:10720, end:11720}
]


export const Default = Template.bind({});
Default.args = {
    route:new Route(routeDescr), markers:[routeDescr.points[0]]
};

export const NoGPX = Template.bind({});
NoGPX.args = {
    route:new Route({...routeDescr,hasGpx:false}), markers:[routeDescr.points[0]]
};

export const GPX = Template.bind({});
GPX.args = {
    route:new Route(gpxDescr), markers:[routeDescr.points[0]]
};


export const Segment = Template.bind({});
Segment.args = {
    title: 'Arnbach',
    markers:[routeDescr.points[0]],
    route: new Route({...routeDescr, segments})
};

export const SegmentWithAvi = Template.bind({});
SegmentWithAvi.args = {
    title: 'Arnbach',
    markers:[routeDescr.points[0]],
    route: new Route({...routeDescr, segments,videoFormat: 'avi'})
};

export const SegmentSelected = Template.bind({});
SegmentSelected.args = {
    title: 'Arnbach',
    route: new Route({...routeDescr, segments}),
    segment:'First km'
};

export const DownloadRequired = Template.bind({});
DownloadRequired.args = {
    route: new Route({...routeDescr, requiresDownload:true})
};

export const DownloadOptional = Template.bind({});
DownloadOptional.args = {
    route: new Route({...routeDescr, requiresDownload:false, isLocal:false})
};

export const ConversionProgress = Template.bind({});
ConversionProgress.args = {
    route: new Route({...routeDescr, videoFormat:'avi'}), 
    convertProgress:80,
    convertOngoing:true
};

export const ConversionError = Template.bind({});
ConversionError.args = {
    route: new Route({...routeDescr, videoFormat:'avi'}), 
    convertProgress:80,
    convertOngoing:true,
    convertError: 'Failed'
};

export const DownloadProgress = Template.bind({});
DownloadProgress.args = {
    route: new Route({...routeDescr, requiresDownload:true, isLocal:false}), 
    downloadProgress:60,
    downloadOngoing: true
};

export const DownloadRequestVideoDir = Template.bind({});
DownloadRequestVideoDir.args = {
    route: new Route({...routeDescr, requiresDownload:true, isLocal:false}), 
    downloadOngoing: true,
    requestVideoDir:true
};

export const ShowLoopOverwrite = Template.bind({});
ShowLoopOverwrite.args = {
    route: new Route(routeDescr), markers:[routeDescr.points[0]],
    showLoopOverwrite:true
};

export const ShowNextOverwrite = Template.bind({});
ShowNextOverwrite.args = {
    route:new Route(routeDescr), markers:[routeDescr.points[0]],
    showNextOverwrite:true
};

export const StartWithWorkoutShown = Template.bind({});
StartWithWorkoutShown.args = {
    route:new Route(routeDescr),
    showWorkout:true
};

export const VideoMissing = Template.bind({});
VideoMissing.args = {
    route:new Route({...routeDescr, videoUrl: 'file:////tmp/someVideo.mp4'}),
    hasVideo:true,
    videoMissing:true
};

export const VideoMissingLongPath = Template.bind({});
VideoMissingLongPath.args = {
    route:new Route({...routeDescr, videoUrl: 'file:////tmp/someVeryLongPath/WitEventLongerSubpath/someVideo.mp4'}),
    hasVideo:true,
    videoMissing:true
};

export const Loading = Template.bind({});
Loading.args = {
    route:new Route(routeDescr),
    hasVideo:true,
    loading:true
};
