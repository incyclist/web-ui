import React, { createRef } from 'react';
import 'react-vis/dist/style.css';
import { XYPlot, XAxis,YAxis,LineSeries,CustomSVGSeries, VerticalBarSeries} from 'react-vis';
import styled from 'styled-components'
import {MaleAvatarGraphics, CoachAvatarGraphics} from '../../atoms/Avatars'
import { useAvatars } from 'incyclist-services';
import { EventLogger } from 'gd-eventlog';
import { ElevationGraphData,getDistance } from './data';
import { Autosize, ErrorBoundary } from '../../atoms';


const Container = styled.div`
    width: ${props => props.width || '100%'};
    height: ${props => props.height || '100%'};
    background-color: ${props => props.backgroundColor || 'none'};
    display:flex;
    overflow:hidden;
    position: ${props => props.wrapped? 'absolute' : 'relative'};
    z-Index: ${props => props.wrapped && props.topOfStack? 1000: props.zIndex};
    top:${props => props.wrapped? 0 : undefined};
    left:${props => props.wrapped? 0 : undefined};
`

export const ElevationGraph = props => <Autosize><Graph {...props} /></Autosize>


class Graph extends React.Component {

    constructor(props) {

        const {xScale={ value:1/1000, unit:'km'}, yScale={ value:1, unit:'m'}, showXUnit=false, showYUnit=true} = props
        super( {...props,xScale, yScale, showXUnit,showYUnit });

        this.state={
            lastUpdateTS: undefined,
            width: props.width,
            height: props.height,
            error: false
        }
        this.data = new ElevationGraphData(this.props)
        this.logger = new EventLogger('ElevationGraph')
        this.onResizeHandler = this.onResize.bind(this)
        this.ref = createRef(null)
        
    }

    



    onResize() {
        if (!this.mounted)
            return;

        this.updateDimensions()
    
    }

    componentDidMount(){

        this.dom = this.ref.current
        this.mounted = true

        //this.updateDimensions()

        window.addEventListener("resize", this.onResizeHandler);
    
    }

    componentDidUpdate(prevProps) {
        if (prevProps.width!==this.props.width || prevProps.height!==this.props.height)
            this.updateDimensions()
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResizeHandler);
        
    }

    updateDimensions( ) {

        this.setState({lastUpdateTS:Date.now(),width:0, height:0} ,()=>{
            if ( this.dom) {
                const current = this.dom
                const parent = current.parentElement || {};

                const width = this.props.width ? current.clientWidth : parent.clientWidth;
                const height = this.props.height ? current.clientHeight : parent.clientHeight;

                this.setState( {width,height,lastUpdateTS:Date.now(),changed:true})
                
            }    
        })
            
    }

    shouldComponentUpdate(newProps, newState) {


        try {

            if (newProps.width!==this.props.width || newProps.height!==this.props.height || newProps.left!==this.props.left ) {

                this.data.processChanges({hasSizeChanged:true,requiresDataUpdate:true},newProps,newState)
                if ( (newProps.width && !this.props.width) || (newProps.width!==this.props.width))
                    this.setState( {width: newProps.width} )
                return true
            }
            
            let requiresNewRender = false
            
            const res = this.data.checkForDataUpdate(newProps, newState, this.props, this.state,this.prevDataTS);

            if (res.requiresDataUpdate)
                requiresNewRender  = true;            

            this.data.processChanges(res,newProps,newState)

            // settings have changed 
            if (  Math.abs(newProps.pctReality-this.props.pctReality)>0.01 || newProps.range!==this.props.range  ) {
                this.data.onSettingsChange()
                requiresNewRender = true
            }

            // we are only taking care if Bars in wrapped component -> no need to refresh unless the route has changed
            if (this.props.wrapped && !this.props.hideBars && !requiresNewRender )
                return false

            // position has changed
            if ( newProps.position !== this.props.position) {
                const fullLap = this.props.lapMode && !this.props.range
                const positionUpdates = this.data.onPositionUpdate(newProps,fullLap);                
                requiresNewRender = requiresNewRender || positionUpdates
            }

            if (newProps.activityList?.length>0 && this.props.hideBars && this.props.wrapped)
                requiresNewRender = true

            return (requiresNewRender||res.requiresDataUpdate)??false
        }
        catch(err) {
            this.logger.logEvent({message:'error',fn:'shouldComponentUpdate', error:err.message, stack:err.stack})
            return false
        }
    }

    

    getData() {
        return this.data.get()
    }

    getDisplayMaxValues(withMarkers) {
        return this.data.getDisplayMaxValues(withMarkers)

    }

    createMarker(position, avatar) {

        
        if (position===undefined || position===null)
            return null;
        let distance = getDistance(position)

        if (distance===null)
            return null;

        if (this.props.lapMode && !this.props.range) {
            distance = distance % this.props.routeData.distance
        }

        const marker = this.data.getMarker( distance );

        if(!marker)
            return null

        const Avatar = avatar?.type==='coach' ? CoachAvatarGraphics : MaleAvatarGraphics
        marker.customComponent = () => {
            return <g className="inner-inner-component" >
                <circle cx="0" cy="0" r={3} fill="yellow" stroke="red"/>
                <g x="0" y="0" transform='translate(-12 -35) scale(0.01 0.01)'  >
                    <Avatar {...avatar}  />
                </g>
            </g>
        }
        return marker
    }

    buildMarkers() {
        const {markers=[],position,hideBars,wrapped} = this.props

        if (wrapped && !hideBars)
            return null;

        const currentAvatar = useAvatars().get('current')
        const posMarkers = markers.map( marker=> this.createMarker(marker,marker.avatar))                        

        if (position!==undefined && position!==null) {
            const marker = this.createMarker(position,currentAvatar)
            if (marker?.x!==undefined && marker?.y!==undefined )
                posMarkers.push(marker);
        }
        return posMarkers.filter(m => m?.x!==undefined && m?.y!==undefined)
    }

    buildMarkersFromActivityList() {
        const {activityList,position} = this.props
        if (activityList?.length>0) {
            return activityList.map( al => this.createMarker(al.distance,al.avatar)).filter( m=>m!==null && m!==undefined )

        }
        else {
            const currentAvatar = useAvatars().get('current')
            if (position!==undefined && position!==null) {
                const marker = this.createMarker(position,currentAvatar)
                if(marker)
                    return [marker]
                else return []
            }
    
        }

    }

    buildMargin() {
        const {showXAxis,showYAxis} = this.props
        const margin = {top: 10, right: 10, left: 50, bottom: 30}

        if (!showYAxis) {
            margin.left = 0;
            margin.right = 0;
        }
        if (!showXAxis) {
            margin.top = 0;
            margin.bottom = 0;
        }
        return margin
    }

    hasSize() {
        return  ( (this.state.width||-1)!==-1 && (this.state.height||-1)!==-1) ;
    }

    componentDidCatch(err, info) {  
        this.logger.logEvent({message:'error',fn:'componentDidCatch', error:err.message, stack:err.stack})
    }

    static getDerivedStateFromError() {
        return { error:true}
    }
    
    render() {

        if (this.state.error)
            return null;
        
        const {showXAxis,showYAxis,line, xScale={ value:1/1000, unit:'km'}, yScale={ value:1, unit:'m'}, showXUnit=false, showYUnit=true } = this.props
        const {width,height} = this.state
        const data = this.getData();

        const axisStyle = { text:{stroke:'white', fontWeight:600}}
        const xTicks = 5;
        const yTicks = 4;

        const margin = this.buildMargin()
        const posMarkers = this.props.activityList ? this.buildMarkersFromActivityList() : this.buildMarkers()
        const [xDomain, yDomain] = this.getDisplayMaxValues(true)
        
        const xUnit = showXUnit ? xScale.unit : ''
        const yUnit = showYUnit ? yScale.unit : ''

        const xTickFormat = v => `${v.toFixed(1)}${xUnit}`
        const yTickFormat = v => `${v.toFixed(0)}${yUnit}`

        if (this.props.hideBars && this.props.wrapped && posMarkers?.length>0)  {

            return (
                <ErrorBoundary hideOnError>
                <Container wrapped={this.props.wrapped} topOfStack={true} className='elevation-position-markers'>
                {this.hasSize()&&data?.length>0 && posMarkers?.length>0?  
                    
                        <XYPlot height={height} width={width} margin={margin} yDomain={yDomain} xDomain={xDomain} >
                            <CustomSVGSeries color={'red'} customComponent="square"  fill={'yellow'} size={10} data={posMarkers} />
                            {showXAxis ? <XAxis attr='x' attrAxis='y' tickTotal={xTicks} tickFormat={ xTickFormat } style={axisStyle}/> : null}
                            {showYAxis ? <YAxis orientation='left' attr='y' attrAxis='x' tickTotal={yTicks} tickFormat={ yTickFormat }style={axisStyle} /> : null}
                        </XYPlot>                                   
                        
                    : null
                }
                </Container>
                </ErrorBoundary>

            )
        }


        
        return (

            <ErrorBoundary hideOnError>
                <Container ref={this.ref} wrapped={this.props.wrapped} className='elevation-diagram'>
                    
                {this.hasSize()&&data?.length>0 ?  
            
                        <XYPlot height={height} width={width} margin={margin} yDomain={yDomain} xDomain={xDomain} >
                            <VerticalBarSeries colorType='literal' data={data} /> 
                            {line?<LineSeries colorType='literal' color={line.color || 'white'}    data={data} /> : null}
                            {showXAxis ? <XAxis attr='x' attrAxis='y' tickTotal={xTicks} tickFormat={ xTickFormat } style={axisStyle}/> : null}
                            {showYAxis ? <YAxis orientation='left' attr='y'  tickTotal={yTicks} tickFormat={ yTickFormat }style={axisStyle} /> : null}
                            {posMarkers?.length>0 ? <CustomSVGSeries color={'red'} customComponent="square"  fill={'yellow'} size={10} data={posMarkers} /> : null}
                        </XYPlot>            
                    
                    :

                    <div>&nbsp;</div>
                }
                </Container>
            </ErrorBoundary>

        )

        
    }
}



