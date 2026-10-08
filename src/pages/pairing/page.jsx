import React from "react"
import { PairingScreen } from "./screen"
import { useLocation } from "react-router";
import { getDevicesPageService } from "incyclist-services";
import InterfaceSettings from "../../components/modules/PairingInfo/InterfaceSettings";
import DeviceSelector from "../../components/modules/PairingInfo/DeviceSelector";
import { usePageService } from "../../hooks/pages";
import { useKey } from "../../hooks/ui/useKey";
import { useAppUI } from "../../bindings/native-ui";

// Opens the pairing page service and renders whatever it hands back - the service now owns the
// OK/Skip/Simulate navigation, the tile order/roles, the row labels, the status line and the
// device-list/interface-settings dialogs (shown whenever `deviceSelection`/`showInterfaceSettings`
// are set). What's left here is platform-only: 'f' fullscreen, Shift+S.
export const PairingPage =  ({mode}) =>{

    const location = useLocation()

    const ui = useAppUI()

    const service = getDevicesPageService()
    const props = usePageService(service, [mode==='start', location?.state?.source])

    useKey( 'f' ,  ()=>{ ui.toggleFullscreen()})

    const onAddSimulator = () => {
        disableSimulatorKey()
        service.addSimulator()
    }

    const  [,disableSimulatorKey] = useKey(  {code:'KeyS',shiftKey:true}, onAddSimulator, {enableDialog:true} )

    if (!props)
        return null

    return (
        <div >
            <PairingScreen  {...props} />

            {props.deviceSelection ? <DeviceSelector {...props.deviceSelection} /> : null}
            {props.showInterfaceSettings ? <InterfaceSettings {...props.showInterfaceSettings} /> : null}

        </div>
    )
}
