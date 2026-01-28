import React from 'react';
import styled from 'styled-components';
import {EventLogger} from 'gd-eventlog'
import { getCoachesService, useRideDisplay, useRouteList, useUserSettings } from 'incyclist-services';

import { AppThemeProvider } from '../../../../theme';
import { EditNumber,Button, Row} from '../../../atoms';
import { DynamicCoachList,DynamicCoachEdit } from '../../Coaches';
import { RIDE_MODES, RIDEVIEW } from './consts';

export const ContentArea = styled.div`
    position:relative;
    width: calc(100% - 2vw);
    // height: calc(100% - 2vh);
    text-align: left;
    margin:auto;
    display: flex;
    flex-direction:column;
    padding-left: 1vw;
    padding-right: 1vw;
    padding-top: 1vh;
    padding-bottom: 1vh;
    padding:1vw;
    top:0;
    left:0;
    background: ${props => props.theme?.dialogContent?.background || 'white'};
    color: ${props => props.theme?.dialogContent?.text };
`;




export const Header = styled.h2`
    font-size: 2vh;
`

export const Radio = props => (
    <input type="radio" {...props} />
)

export const Input = styled.input`
    height: 1.5vh;
`

export class RideSettings extends React.Component {

    constructor(props) {
        super(props);
        
        this.logger = props.logger || new EventLogger('RideOptions','RidePage');
        this.settings = useUserSettings()
        this.ride = useRideDisplay()
        this.routes = useRouteList()

        this.state =  this.getPreferences();
        this.state.showCoachEditDialog = false;
        this.state.coachEditDialogProps = {}
    }

    getPreferences() {

        const preferences = {
            rideView: this.settings.getValue('preferences.rideView', RIDEVIEW.DEFAULT),
            reality: this.routes.getStartSettings()?.realityFactor ?? this.props.reality ?? 100,
            renderKey: Date.now()
        }
        
        return preferences;
    }

    updateSettings() {
        const {onSettingsChanged} = this.props;
        if ( onSettingsChanged && typeof(onSettingsChanged) === 'function') {
            onSettingsChanged('route',this.state);
        }
    }

    onRideViewSelected(value) {
        this.logger.logEvent( {message: 'radio clicked',radio:'Ride view preference',value, eventSource:'user'})

        this.settings.set('preferences.rideView',value)
        this.setState({rideView:value},()=>{
            this.updateSettings();
        })

    }

    onChangeRealityFactor(value) {
        const startSettings = this.routes.getStartSettings();
        if (startSettings) {
            startSettings.realityFactor = value;
        }
        this.setState({reality:value},()=>{
            this.updateSettings();
        })

    }


    onAddCoachClick() {
        this.showCoachEditDialog()
    }

    onListUpdated(coach) {
        
        this.onCoachEditDone()
        return;
    }

    onEditCoach(coach) {
        if (!this.props.onCoachesChanged) 
            return;

        const {coaches=[]} = this.props;

        let idx;
        if ( coach.idx!==undefined && coach.idx!==null)
            idx = coach.idx
        else {
            idx = coaches.findIndex( (c) => c.name===coach.name && c.power===coach.power && c.speed===coach.speed && c.routeDistance===coach.routeDistance)            
        }
        this.showCoachEditDialog( coach,idx)
    
    }

    showCoachEditDialog( coach,index) {
        const coachEditDialogProps= { 
            ...coach, 
            onCancel:()=>{this.hideCachEditDialog()},
            onOK: (c) => {this.onCoachEditDone(c)}
        }
        this.setState( {showCoachEditDialog:true,coachEditDialogProps })

    }
    hideCachEditDialog() {
        this.setState( {showCoachEditDialog:false})
    }

    onCoachEditDone( coach) {
        const service = getCoachesService()
        this.setState({renderKey:Date.now(),showCoachEditDialog:false})
        

        const coaches = service.getCoaches()||[]
        const result = [...coaches]

        if (this.props?.onCoachesChanged)
            this.props.onCoachesChanged(result)
    }
    
    render() {
        const {rideView,reality} = this.state;
        const coachSupported = true;
        const {rideMode: legacyRideMode} = this.props;
        const rideMode = this.ride.getRideType();

        const hasElevation  =  (rideMode==='GPX' || rideMode==='Video' || /* legacy ...*/legacyRideMode===RIDE_MODES.FOLLOW_ROUTE || legacyRideMode===RIDE_MODES.VIDEO )


        const props = {legacyRideMode,rideMode, rideView, hasElevation, reality, coachSupported, }
        return <RideSettingsView {...props} 
            showCoachEditDialog= {this.state.showCoachEditDialog}
            coachEditDialogProps= {this.state.coachEditDialogProps??{}}
            onRideViewSelected={this.onRideViewSelected.bind(this)}
            onChangeRealityFactor={this.onChangeRealityFactor.bind(this)}
            onCoachEditDone = {this.onCoachEditDone.bind(this)}
            onAddCoach = {this.onAddCoachClick.bind(this)}
            />

    }
}

export const RideSettingsView = ( props)=> {

    const {legacyRideMode, rideMode, rideView, hasElevation, reality=100, coachSupported,showCoachEditDialog,coachEditDialogProps,
        onRideViewSelected,onChangeRealityFactor,onCoachEditDone,onAddCoach

    } = props

        return (
            <AppThemeProvider>
            <ContentArea>    
                { (rideMode===undefined && (legacyRideMode===undefined|| legacyRideMode!==RIDE_MODES.VIDEO))
                   || (rideMode==='Free-Ride' || rideMode==='GPX')  ? 
                <div>
                    <div>
                        <Header>View Preference</Header>
                    </div>                
                    <div>
                        <Radio 
                            checked= { rideView===RIDEVIEW.STREETVIEW}
                            name='streetview' 
                            value={RIDEVIEW.STREETVIEW} onChange={ (event) => onRideViewSelected( event.target.value)}
                        />
                        <label htmlFor='streetview'>Street View</label>
                        <Radio 
                            checked= { rideView===RIDEVIEW.SATTELITE}
                            name='satelite' 
                            value={RIDEVIEW.SATTELITE} onChange={ (event) => onRideViewSelected( event.target.value)}
                        />
                        <label htmlFor='streetview'>Satelite View</label>
                        <Radio 
                            checked= { rideView===RIDEVIEW.MAP}
                            name='satelite' 
                            value={RIDEVIEW.MAP} onChange={ (event) => onRideViewSelected( event.target.value)}
                        />
                        <label htmlFor='streetview'>Map</label>
                    </div>
                </div> : null 
                }

                { hasElevation  ? 
                    <>
                        <Row> 
                            <Header>Current Ride Preferences</Header> 
                        </Row>
                            <EditNumber label='Reality Factor' labelPosition='before' labelWidth='15ch' unit='%'
                                    value={reality} min={0} max={100} digits={0}
                                    onValueChange={ onChangeRealityFactor} />
                        </>                            
                    : null }
    
                { coachSupported ? <div> <Header>Coach(es)</Header> </div>: null}
                { coachSupported ? 
                    <div style={{width:'50vw' }}> 
                        <DynamicCoachList  onUpdate={onCoachEditDone} /> 
                        <Button fontSize='1.6vh' height='3.2vh' onClick={onAddCoach}>Add Coach</Button>
                    </div>
                    : 
                    null
                }
                {showCoachEditDialog ? <DynamicCoachEdit {...coachEditDialogProps}/>:null}
                
            </ContentArea>
            </AppThemeProvider>
        )

}
