import React, { useEffect, useState } from "react"
import { DeviceSelector } from "./component"
import { useDevicePairing } from "incyclist-services";
import { IncyclistCapability } from "incyclist-devices";

export const Wrapper = ( props)=> {

    const {capability, onOK, onCancel} = props;
    const pairing = useDevicePairing()

    const [initialized,setInitialized] = useState(false)
    const [state,setState] = useState(null)
    const [changeForAll,setChangeForAll] = useState( props.capability===IncyclistCapability.Control)

    useEffect( ()=> {
        if (initialized)
            return;
        setInitialized(true)
        const initialState = pairing.startDeviceSelection(capability,(data)=> {
            
            process.nextTick( ()=> {
                setState(data)
            })
            
        })
        setState(initialState)
    },[capability, initialized, pairing])


    const onDeleteClicked = (udid) => {
        pairing.deleteDevice(capability,udid)

    }

    const onSearchClicked = (udid) => {

    }

    const onUserCancel = () => {
        pairing.stopDeviceSelection()
        if (onCancel)
            onCancel()
    }

    const onSelected = (udid) => {
        pairing.selectDevice(capability,udid,changeForAll)
        if (onOK)
            onOK()
    }

    const onAll = (checked) => {
        setChangeForAll(checked)
    }
    

    const getChildProps = () => {

        const canSelectAll = capability===IncyclistCapability.Control
        
         if (!state) {
            return ( {loading:true, capability, canSelectAll, devices:[], changeForAll, onOK:onSelected, onCancel:onUserCancel, onAll, onSearch:onSearchClicked, onDelete:onDeleteClicked})
        }
        else {
            const {isScanning} = state
            return ( {isScanning,capability, canSelectAll, devices:state.devices,changeForAll, onOK:onSelected, onCancel:onUserCancel, onAll, onSearch:onSearchClicked, onDelete:onDeleteClicked})
        }

    }
    if (!state)
        return null

    return <DeviceSelector {...getChildProps()} />
}