import { copyPropsExcluding } from "../../../../../utils/props"
import React from "react"
import {ElevationGraph} from "../../../../molecules/ElevationGraph/ElevationGraph"
import styled from "styled-components"
import { Dynamic } from "../../../../atoms"
import { useActiveRides  } from "incyclist-services"
import { EventLogger } from "gd-eventlog"

const DEFAULT_MAX_UPDATE_FREQ = 1000

const Container = styled.div`
    width: ${props => props.width || '100%'};
    height: ${props => props.height || '100%'};
    background-color: ${props => props.backgroundColor || 'none'};
    display:flex;
    overflow:hidden;
    position:relative;
    
`

/*
    TODO:  this components needs to be refactored after the ride page has been changed and the context has been removed
            due to the cavailablitly of the context, the component gets rendered many times ( basically any time something changes somewhere)
            whereas it should only change if its key props would change

            I.e. the shouldComponentUpdate() calls in ths component and the ElevationGraph component can be removed of simplified and event some of the wrapper layers should be removed
*/


export class TotalElevationOverlay extends React.Component {


    constructor(props) {
        super(props)
        this.maxUpdateFreq = props.maxUpdateFreq??DEFAULT_MAX_UPDATE_FREQ
        this.prevRender = 0
        this.logger = new EventLogger('TotalElevationOverlay')
        this.service = useActiveRides()
        this.hasActiveRides = this.service.get().length>0
    }
    
    
    shouldComponentUpdate(newProps) {

        if (!this.prevRender)
            return true

        try {
            if (!this.newActiveRides){
                //return true
                return  newProps.position?.routeDistance!==this.props.position?.routeDistance || 
                        newProps.routeData?.distance !==this.props.routeData?.distance ||
                        Math.abs(newProps.pctReality-this.props.pctReality)>0.01 ||
                        newProps.range!==this.props.range
            }

            const hasActiveRides = this.service?.get().length>0
            

            const hasActiveRidesChanged = (hasActiveRides && !this.hasActiveRides) || (!hasActiveRides && !this.hasActiveRides)
            const posChanged = newProps.position?.routeDistance!==this.props.position?.routeDistance
            const routeChanged = newProps.routeData?.distance!==this.props.routeData?.distance
        
            this.hasActiveRides = hasActiveRides

            if (hasActiveRidesChanged || routeChanged )
                return true
            
            return (posChanged && Date.now() - this.prevRender > this.maxUpdateFreq)
        }
        catch(err) {
            this.logger.logEvent({message:'error',fn:'shouldComponentUpdate', error:err.message, stack:err.stack})
            return true
        }
    }
    

    render() {
        try {
            
            this.prevRender = Date.now()
            let childProps = this.props??{}
            if (this.newActiveRides) {
        
                const hasActiveRides = this.service?.get().length>0
                let excludes = ['markers','rideState','visible','observer','onSettingsChanged','opacity','settings']          
                
                if (hasActiveRides) {
                    excludes.push('position')
                }
                childProps = copyPropsExcluding(this.props,excludes) 

                if (hasActiveRides) {
                    childProps.observer = this.service.getObserver()
                }
                
            }
        
        
            
            return <TotalElevationOverlayView {...childProps} />
        }
        catch(err) {
            console.log('# error',err)
            return <TotalElevationOverlayView {...this.props} />
        }    
    }


}

export const TotalElevationOverlayView = (props) =>{

    const Graph = React.memo( ElevationGraph)

    const propsGraph = copyPropsExcluding(props,['observer','markers','position','rideState','visible','observer','onSettingsChanged','opacity','settings'])
    const propsPos = copyPropsExcluding(props,['observer','markers','rideState','visible','observer','onSettingsChanged','opacity','settings'])

    return( 
        <Container className='elevation-wrapper'>
            {props.observer? 
                <Dynamic observer={props.observer} event='update' prop='activityList' >
                    <ElevationGraph {...propsPos} activityList={[]} hideBars={true} wrapped={true}/> 
                </Dynamic>
                :
                <Graph {...propsPos} markers={props.markers} hideBars={true} wrapped={true} /> 
            }


            <ElevationGraph {...propsGraph} hideBars={false} wrapped={true} />
        </Container>
    )
}