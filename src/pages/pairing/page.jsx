import React, { useCallback, useEffect, useRef, useState } from "react"
import { PairingScreen } from "./screen"
import { useLocation, useNavigate} from "react-router";
import { getRouteList, useAppState, useDeviceAccess, useDeviceConfiguration, useDevicePairing, useDeviceRide, useWorkoutList  } from "incyclist-services";
import InterfaceSettings from "../../components/modules/PairingInfo/InterfaceSettings";
import { clone } from "../../utils/coding";
import DeviceSelector from "../../components/modules/PairingInfo/DeviceSelector";
import {usePageLogger, useUnmountEffect} from "../../hooks";
import { useKey } from "../../hooks/ui/useKey";
import { useAppUI } from "../../bindings/native-ui";
import { DialogLauncher } from "../../components/molecules";

export const PairingPage =  ({mode}) =>{
    
    const navigate = useNavigate();
    const location = useLocation()

    const deviceConfig = useDeviceConfiguration()
    const devicePairing = useDevicePairing()
    const deviceAccess = useDeviceAccess()
    const workoutList = useWorkoutList()
    const ride = useDeviceRide()    

    const initialized = useRef(false)
    const [initializing,setInitializing] = useState(false)

    const [capabilities,setCapabilities] = useState([])
    const [interfaces,setInterfaces] = useState([])
    const [canStartRide,setCanStartRide] = useState(false)

    const [pageState,setPageState] = useState(null)  

    const simRef = useRef(false)
    const ui = useAppUI()
    const ref = useRef();

    const appState = useAppState()


    useEffect( ()=>{
        if (!pageState)
            setPageState('open')
    },[pageState])

    useKey( 'f' ,  ()=>{ ui.toggleFullscreen()})


    const [logger,closePage] = usePageLogger('Pairing',pageState)


    // const wasPaired = ()=> {
    //     return appState.getState('paired')
    // }

    const setPaired = ()=> {
        appState.setState('paired',true)
    }

    const getNextPage = () => {

        const nextPage = appState.getPersistedState('page')??'routes'
        return `/${nextPage}`

    }

    useUnmountEffect( ()=> {
        //console.log('# pairing page unmounted')
    })


    const onStateChanged = useCallback ((newState) =>{
        try {
            if (newState.capabilities)    
                setCapabilities( clone(newState.capabilities))
            if (newState.interfaces)    
                setInterfaces([...newState.interfaces])
            if (newState.canStartRide!==undefined) {
                if (newState.canStartRide!==canStartRide)
                    logger.logEvent({message:'Pairing state changed ',canStartRide:newState.canStartRide})
                
                setCanStartRide( newState.canStartRide)
            }
        }
        catch(err) {
            logger.logEvent({message:'Error', fn:'onStateChanged',error:err.message,stack:err.stack})
        }
    },[canStartRide, logger]    )


    useEffect( ()=>{        
        if (!initialized.current && !initializing) {            
            setInitializing(true)

            if (mode==='start') {
                
                if (ride.canEnforceSimulator()) {
                    simRef.current = true    
                }
                
                
            }

            devicePairing.start(onStateChanged)
                .then( ()=> {
                    
                    initialized.current = true
                    setInitializing(false)

                })
        }          
        
        
    }, [initialized, initializing, devicePairing, logger, onStateChanged, ride, mode])



    const onAddSimulator = (info) => {
        disableSimulatorKey()
        deviceConfig.add({name:'Simulator', interface:'simulator'})
    }
    
    const  [,disableSimulatorKey] = useKey(  {code:'KeyS',shiftKey:true}, onAddSimulator, {enableDialog:true} )


    const onInterfaceSettingsChanged = (ifName,settings) =>{  
        devicePairing.changeInterfaceSettings(ifName,settings)
        closeDialog()
    }

    const getInterfaceSettings = (ifName,v=interfaces) => {
        if(!v)
            return {}
        return v.find(i=>i.name===ifName)
    }


    const openSettingsDialog = (props) => {        
        //setShowDialog({dialog:'interfaceSettings',props})    
        openDialog(InterfaceSettings,props)    
    }
    const openDevicesDialog = (props) => {        
        openDialog(DeviceSelector,props)
        //setShowDialog({dialog:'devices',props})        
    }

    const openDialog = ( Dialog,props)=> {
        ref.current.openDialog(Dialog,props)
    }
    const closeDialog = ()=> {
        ref.current.closeDialog()
    }


    const onSkipClicked = ()=>{
        devicePairing.stop()
        const pathname =  location?.state?.source ?? getNextPage()

        logger.logEvent({message:'navigating to ',pathname})        
        navigate(pathname)
        closePage()        
    }

    const onOKClicked = ()=>{

        
        devicePairing.prepareStart()
        devicePairing.setReadyToStart()

        //const alreadyPaired = wasPaired()

        setPaired()

        const selectedRoute = getRouteList().getSelected()
        const selectedWorkout = workoutList.getSelected()
        const startSettings = getRouteList().getStartSettings()
        const isRideReadyS = (selectedRoute||selectedWorkout||startSettings?.type==='Free-Ride')
        const isRideReady =  isRideReadyS!==undefined && isRideReadyS!==false


        const pathname =  isRideReady ? '/rideDeviceOK': getNextPage()

        const state = {source: location?.state?.source}
        
        logger.logEvent({message:'navigating to ',pathname, isRideReady, selectedRoute:selectedRoute?.title,selectedWorkout:selectedWorkout?.name,startSettings})
        navigate(pathname,state)
        closePage()
    }

    const onSimulateClicked = () => { 
        const simulator = deviceConfig.getSimulatorAdapterId()
        devicePairing.prepareStart([simulator])

        const selectedRoute = getRouteList().getSelected()
        const selectedWorkout = workoutList.getSelected()
        const startSettings = getRouteList().getStartSettings()
        const isRideReadyS = selectedRoute||selectedWorkout||startSettings?.type==='Free-Ride'
        const isRideReady =  isRideReadyS!==undefined && isRideReadyS!==false


        const pathname =  isRideReady ? '/rideSimulate':  getNextPage()
        const state = {source: location?.state?.source}
        logger.logEvent({message:'navigating to ',pathname, isRideReady, selectedRoute:selectedRoute?.title,selectedWorkout:selectedWorkout?.name,startSettings})
        navigate(pathname,{state})
        closePage()
    }



    const onInterfaceClicked = (ifName) => {      
        const protocols = deviceAccess.getProtocols(ifName)
        const settings=getInterfaceSettings(ifName)
        const onOK = (settings)=>onInterfaceSettingsChanged(ifName,settings)

        openSettingsDialog( {name:ifName,protocols, ...settings, onOK} )
    }

    const onCapabilityClicked = (capability) => {
        
        const onCancel= onCapabilityCancelled
        
        openDevicesDialog( {capability,onCancel,onOK:closeDialog})
    }

    const onCapabilityUnselect = (capability => {
        devicePairing.unselectDevices(capability)
    })

    const onCapabilityCancelled = (capability) => {
        closeDialog()
    }

    if (pageState==='closed')
        return null;


 
    const showSimulate = simRef.current
    return (
        <div >
            <PairingScreen  zIndex={1} initialized={initialized.current} interfaces={interfaces} capabilities={capabilities} readyToStart={canStartRide}
                onSkip = {onSkipClicked}
                onOK = {onOKClicked}
                onSimulate = {onSimulateClicked}
                onCapabilityClick={ onCapabilityClicked}
                onCapabilityUnselect={ onCapabilityUnselect}
                onInterfaceClick={ onInterfaceClicked}
                showSimulate={showSimulate}
                labelOK= {mode==='start' ? 'Start' : undefined}
                labelSkip= {mode==='start' ? 'Cancel' : undefined}
                title = {mode==='start' ? 'Paired Devices for Ride' : undefined}
            />

            <DialogLauncher ref={ref}/>


        </div>
    )
}