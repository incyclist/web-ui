import  {MapOverlay} from './MapOverlay'
import sydney from '../../../../../__tests__/testdata/sydney.json'
import teide from '../../../../../__tests__/testdata/ES_Teide.json'
import React, { useState,useRef, useEffect } from 'react'
import { Overlay } from '../../../../atoms';
import { useUnmountEffect } from '../../../../../hooks';

export default {
    component: MapOverlay,
    title: 'modules/ride/overlays/MapOverlay', 
    argTypes: { 
        onViewportChange: { action: 'viewport changed' },
    },
}


const correctLegacy = (r) => {
    if (r.decoded) {
        r.points = r.decoded
        delete r.decoded
    }
}

correctLegacy(sydney)
correctLegacy(teide)

const Template =  args => <Overlay background='none' shadow={false} padding={0} border={''} ><MapOverlay {...args} /></Overlay>;

const UpdateTest = (props) =>  {
    const [center,setCenter] = useState(props.center)
    const refPnt = useRef(0)
    const refIv = useRef(null)
    
    useEffect ( ()=> {
        if (refIv.current)
            return

        refPnt.current = 0
        refIv.current = setInterval( ()=>{
            const points = props.routeData.points
            setCenter( 
                points[++refPnt.current % points.length]
            )
            console.log('# cneter',refPnt.current)
        }, 2000)

    })
    

    useUnmountEffect( ()=> {
        if (refIv.current)
            clearInterval(refIv.current)

        refPnt.current = 0
    })

    const mapProps = JSON.parse(JSON.stringify(props))
    delete mapProps.center

    return <Template {...props}  center={center} position={center} />
}

export const Default = Template.bind({});
Default.args = {
    width: '25vw',
    height: '35vh',
    routeData: sydney,
    position: sydney.points[0]
}

export const WithCenter = Template.bind({});
WithCenter.args = {
    width: '25vw',
    height: '35vh',
    routeData: teide,
    position: teide.points[0],
    center: teide.points[0]
}

export const WithCenterAndZoom = Template.bind({});
WithCenterAndZoom.args = {
    width: '25vw',
    height: '35vh',
    routeData: teide,
    position: teide.points[0],
    center: teide.points[0],
    viewport: {
        zoom:18
    }
}

export const Updating = UpdateTest.bind({});
Updating.args = {
    width: '25vw',
    height: '35vh',
    routeData: teide,
    position: teide.points[0],
    center: teide.points[0]
}

export const WithMarkers = Template.bind({});
WithMarkers.args = {
    width: '25vw',
    height: '35vh',
    routeData: sydney,
    position: sydney.points[0],
    markers:[
        {...sydney.points[10], avatar:{shirt:'red'} },
        {...sydney.points[12], avatar:{shirt:'green'} }
    ]
}

export const WithStartPos = Template.bind({});
WithStartPos.args = {
    width: '25vw',
    height: '35vh',
    routeData: sydney,
    position: sydney.points[10],
    startPos: 100,
}

export const WithStartEndPos = Template.bind({});
WithStartEndPos.args = {
    width: '25vw',
    height: '35vh',
    routeData: sydney,
    position: sydney.points[10],
    startPos: 100,
    endPos: 1000
}


