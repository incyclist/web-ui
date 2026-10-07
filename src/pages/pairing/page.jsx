import React, { useRef } from "react"
import { PairingScreen } from "./screen"
import { useLocation } from "react-router";
import { getDevicesPageService, useDeviceAccess, useDevicePairing } from "incyclist-services";
import InterfaceSettings from "../../components/modules/PairingInfo/InterfaceSettings";
import DeviceSelector from "../../components/modules/PairingInfo/DeviceSelector";
import { usePageService } from "../../hooks/pages";
import { useKey } from "../../hooks/ui/useKey";
import { useAppUI } from "../../bindings/native-ui";
import { DialogLauncher } from "../../components/molecules";

// Opens the pairing page service and renders whatever it hands back - the service now owns the
// OK/Skip/Simulate navigation, the tile order/roles, the row labels and the status line (all of
// that used to be worked out here and in screen.jsx). What's left here is what the service can't
// own yet: the device-list and interface-settings dialogs still talk to incyclist-services
// directly (unchanged from before), and platform-only bits - 'f' fullscreen, Shift+S.
export const PairingPage =  ({mode}) =>{

    const location = useLocation()

    const devicePairing = useDevicePairing()
    const deviceAccess = useDeviceAccess()

    const ui = useAppUI()
    const ref = useRef();

    const service = getDevicesPageService()
    const props = usePageService(service, [mode==='start', location?.state?.source])

    useKey( 'f' ,  ()=>{ ui.toggleFullscreen()})

    const onAddSimulator = () => {
        disableSimulatorKey()
        service.addSimulator()
    }

    const  [,disableSimulatorKey] = useKey(  {code:'KeyS',shiftKey:true}, onAddSimulator, {enableDialog:true} )

    const openDialog = ( Dialog,dialogProps)=> {
        ref.current.openDialog(Dialog,dialogProps)
    }
    const closeDialog = ()=> {
        ref.current.closeDialog()
    }

    const onInterfaceSettingsChanged = (ifName,settings) =>{
        devicePairing.changeInterfaceSettings(ifName,settings)
        closeDialog()
    }

    const getInterfaceSettings = (ifName) => {
        const current = devicePairing.getState()?.interfaces
        return current?.find(i=>i.name===ifName) ?? {}
    }

    const onInterfaceClicked = (ifName) => {
        const protocols = deviceAccess.getProtocols(ifName)
        const settings=getInterfaceSettings(ifName)
        const onOK = (settings)=>onInterfaceSettingsChanged(ifName,settings)

        openDialog(InterfaceSettings, {name:ifName,protocols, ...settings, onOK})
    }

    const onCapabilityClicked = (capability) => {
        openDialog(DeviceSelector, {capability, onCancel:closeDialog, onOK:closeDialog})
    }

    if (!props)
        return null

    return (
        <div >
            <PairingScreen  {...props}
                onCapabilityClick={ onCapabilityClicked}
                onInterfaceClick={ onInterfaceClicked}
            />

            <DialogLauncher ref={ref}/>

        </div>
    )
}
