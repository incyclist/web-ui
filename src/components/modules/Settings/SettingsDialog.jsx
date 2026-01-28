import React, { useState } from "react"
import { useDeviceConfiguration } from "incyclist-services"
import { AppThemeProvider } from "../../../theme"
import { Dialog, Tabs } from "../../molecules"
import { RideSettings } from "./Ride"
import { AppsSettings } from "./Apps"
import { SupportArea } from "./Support"
import { Button, ButtonBar } from "../../atoms"
import { GearSettings } from "./Gear"

export const SettingsDialog = ({onOK})=> {

    const deviceConfig = useDeviceConfiguration()
    const gearOK = deviceConfig.canStartRide()

    const onOKClicked = ()=> {
        if (onOK)
            onOK()
    }

    return <SettingsDialogView noGear={!gearOK} 
        onOK={onOKClicked} 
        />

}

export const SettingsDialogView = ({onOK, onCoachesChanged, onSettingsChanged, noGear }) => {
    const defArea = 'Ride'
    const [area,setArea] = useState( defArea)

    const onAreaChanged =(newArea) => {
        setArea(newArea)
    }

    const getSelectedArea = () => {
        if ( noGear && area==='Gear')
            return 'User'
        return area;
    }

    const active = getSelectedArea()
    const showGear = !noGear

    return (
        <AppThemeProvider>
        <Dialog id='Settings' className='dialog settings' level={1}  onESC={onOK}>
            
            <Tabs zIndex={10} activeTab={active} onChangeTab={onAreaChanged} buttonBar={true}>
                {showGear ?  <GearSettings label='Gear' />:null}                
                <RideSettings label='Ride' /> 
                <AppsSettings label='Apps'   />
                <SupportArea label='Support' />                 
            </Tabs>

            <ButtonBar justify='center'>
                <Button height={'5vh'} primary={false} text='OK' onClick={onOK} />
            </ButtonBar> 
        </Dialog>
        </AppThemeProvider>
    )

}


