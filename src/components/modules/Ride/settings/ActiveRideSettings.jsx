import React from 'react';
import styled from 'styled-components';
import { Button,ButtonBar } from '../../../atoms';
import { Dialog,Tabs} from '../../../molecules';
import { AppThemeProvider } from '../../../../theme';
import { useActivityRide } from 'incyclist-services';
import { DynamicActivitySummary } from '../summary/wrapper';
import { AppsSettings,UserSettings,SupportArea, GearSettings, RideSettings, WorkoutSettings } from '../../Settings';
import { EventLogger } from 'gd-eventlog';



export const ContentArea = styled.div`
    position:relative;
    width: 100%;
    height: 100%;
    text-align: center ;
    margin:auto;
    display: flex;
    padding:0;
    top:0;
    left:0;
    height: calc(100% - 7.7vh);
    width: 100%;
    background: ${props => props.theme?.dialog?.background || props.background || 'white'};
`;

const SAVING_STATES = {
    IDLE:'Idle',
    SAVING:'Save:Started',
    SAVED:'Save:Done',
    CONVERTING: 'Convert:Started',
    CONVERTED:'Convert:Done',
    UPLOADING: 'Upload:Started',
    UPLOADED:'Upload:Done',
    DONE: 'Done',
    ERROR: 'Error'
}


export class ActiveRideSettings extends React.Component {

    constructor(props) {    
        super(props);
        this.name = 'ActiveRideSettings';

        this.state = {
            hasError: false,
            area: props?.area
        }
        
        this.logger = new EventLogger('ActiveRideSettings','RidePage');
        
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        console.log('# ERROR',error)
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        this.logError(error, errorInfo);
    }

    componentDidUpdate( prevProps,prevState ) {
        if (this.props.areaSelected && prevProps.areaSelected===undefined) 
            this.setState( {area:this.props.areaSelected})

    }


    logError(err, errorInfo) {
        this.logger.logEvent( {message:'error in component',component:this.name,error:err.message,errorInfo})
    }


    getSelectedArea(gearDisabled,activityDisabled) {
        let area = this.state.area;
        
        if ( gearDisabled && area==='Gear')
            area = 'User'
        if ( activityDisabled && area==='Activity')
            area = 'User'
        return area;
    }



    getRouteProps() {
        const routeOptions = this.props.routeOptions || {}
        const routeDistance = this.props.activity ? this.props.activity.distance : undefined ;
        
        return {...routeOptions, routeDistance, logger: this.logger, onSettingsChanged: this.props.onSettingsChanged, onCoachesChanged: this.props.onCoachesChanged}
    }

    getWorkoutProps() {
        const {workout,user} = this.props
        return {workout,user,logger: this.logger, onSettingsChanged: this.props.onSettingsChanged}
    }

    getGearProps() {
        if (!this.gearProps) {
            const options = this.props.gearOptions || {}
            options.onSettingsChanged= (area,preferences)=> { 
                const {mode,settings,device,input,selectedMode} = preferences;
                Object.keys({settings,device,input}).forEach(key=> {this.gearProps[key] = preferences[key]})
                this.gearProps.mode = selectedMode
                
                this.props.onSettingsChanged(area,{mode,settings,device}) 
            }
            this.gearProps = options;
            return options;
        }
        return this.gearProps
        
    }

    onAreaSelected(area) {
        this.logger.logEvent( {message:'area selected',area,eventSource:'user'})
        this.setState( {area})

        if (this.props.onAreaChanged && typeof (this.props.onAreaChanged) === 'function') {
            this.props.onAreaChanged(area);
        }
    }

    render() {
        const { area: areaSettings, gearOptions={} } = this.props;
        const { disabled} = areaSettings || {};

        const savingState = this.props.savingState || SAVING_STATES.IDLE;
        const activity = useActivityRide().getActivity()
        let renderNew = (activity!==undefined) //area==='Activity';// && this.props.new
        let renderContinue = (this.props.back===undefined) && (this.props.finished!==true);
        let renderExit = true;
        let renderBack = this.props.back!==undefined;
        let renderOK = false;


        let saveDisabled =  savingState!==SAVING_STATES.IDLE;

        let area = this.getSelectedArea(gearOptions.disabled , disabled?.ride);
        if ( this.state.hasError)
            area = area==='Sport' ? 'Apps' :'Support'

        const showUser = !this.props.hidden?.includes('User')
        const showWorkout = !this.props.hidden?.includes('Workout')
        const showGear = this.props.noGear ? false:  !gearOptions.disabled && !this.props.hidden?.includes('Gear')
        const showActivity = activity!==undefined && (!disabled?.ride && !this.props.hidden?.includes('Activity'))
        const showSupport = !this.props.hidden?.includes('Support')
        const showApps = !this.props.hidden?.includes('Apps')
        const showRide = !this.props.hidden?.includes('Ride')

        const eventHandlers = {
            onExit: this.props.onExit,
            onContinue: this.props.onContinue,
            onOK: this.props.onOK,
            onNew: this.props.onNew,
            onBack: this.props.onBack
        }


        return (
            <AppThemeProvider>
            <Dialog id='RideOptions' className='dialog rideOptions' level={1}  onESC={this.props.onOK}>
                
                    <Tabs zIndex={10} activeTab={area} onChangeTab={(tab)=>this.onAreaSelected(tab)} buttonBar={true}>
                        
                        {showUser ? <UserSettings label='User' onChange={this.props.onUserChanged} /> : null}
                        {showWorkout ? <WorkoutSettings label='Workout' onWorkoutChanged={this.props.onWorkoutChanged}  />:null}
                        {showGear ?  <GearSettings label='Gear' {...this.getGearProps()} />:null}
                        {showRide ? <RideSettings label='Ride' {...this.getRouteProps()} /> : null}
                        {showActivity ? <DynamicActivitySummary label='Activity' manageButtons={true} showContinue={renderContinue} {...eventHandlers} /> : null}
                        {showApps? <AppsSettings label='Apps' />: null}
                        {showSupport  ? <SupportArea label='Support' user={this.props.user} /> : null}
                        
                    </Tabs>
                
                {!showActivity || this.state.area!=='Activity' ? 
                <ButtonBar justify='center'>
                    
                    {renderBack ? <Button height={'5vh'} primary={false} text='Back' onClick={ this.props.onBack} /> : null}  
                    {renderNew ? <Button height={'5vh'} primary={true} text='New Ride' disabled={saveDisabled} onClick={this.props.onNew} />:null} 
                    {renderContinue ? <Button height={'5vh'} primary={false} text='Continue' onClick={this.props.onContinue} /> : null} 
                    {renderExit ? <Button height={'5vh'} primary={false} text='Exit App' onClick={this.props.onExit} /> : null}             
                    {renderOK ? <Button height={'5vh'} primary={false} text='OK' onClick={this.props.onOK} /> : null}             
                </ButtonBar> :null}

            </Dialog>
            </AppThemeProvider>
        )
    }

}