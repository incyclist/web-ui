import React from 'react';
import {clone} from '../../../../utils/coding'
import { useDeviceConfiguration } from 'incyclist-services';
import { GearSettingsView }  from './GearSettingsView';
import { EventLogger } from 'gd-eventlog';


export class GearSettings extends React.PureComponent { 

    constructor() {
        
        super()
        this.state={
            mounted: false,
            settings:{}
        }
        this.configChangedHandler = this.onConfigChanged.bind(this)
        this.logger = new EventLogger('GearSettings')
    }

    componentDidMount() {
        try {
            this.config = useDeviceConfiguration()
            this.config.on('mode-changed', this.configChangedHandler)
    
            //it is dafe to assume that the config was already initialized
            //but just to be sure ....
            if (!this.config.isInitialized()) {
    
            }
            else {
                const {udid,mode,settings,options} = this.config.getModeSettings()??{}
                
                const mounted = true;
                this.setState({udid,settings,mode,options,mounted})
                this.logger.set({udid})
            }
    
        }
        catch(err) {
            this.logger.logEvent( {message:'component error', error:err.message, stack:err.stack})
        }
        
    }

    componentWillUnmount() {
        this.config.off('mode-changed', this.configChangedHandler)
    }

    componentDidCatch(err) {
        this.logger.logEvent({message:'component error', error:err.message, stack:err.stack})
    }

    onConfigChanged(udid,mode,settings) {
        // React does not recognize if changes within the settings object were made
        // therefore we use tsLastChange to enfore re-render
        this.setState({udid,mode,settings, tsLastChange:Date.now()}) 
    }

    onChangeMode(mode) {
        this.logger.logEvent( {message:'cycling mode selected',mode,eventSource:'user'})
        const {udid} = this.state;
        this.config.setMode(udid,mode)
    }

    onChangeSetting(property, value) {
        const {udid,mode,settings} = this.state;
        this.logger.logEvent( {message:'cycling mode property changed',mode,property,value,eventSource:'user'})

        let updatedSettings = settings? clone(settings) : {}
        
        updatedSettings[property] = value;
        this.config.setModeSettings(udid,mode,updatedSettings)
    }

    render() {
        const {settings,mode,options} = this.state

        const props = {
            disabled:false,
            mode,
            settings,
            options,
            onChangeMode: this.onChangeMode.bind(this),
            onChangeSetting: this.onChangeSetting.bind(this)
        }
        return (
            <GearSettingsView {...props} />
        )
        
    }
}

