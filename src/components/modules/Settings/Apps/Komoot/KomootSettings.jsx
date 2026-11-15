import React, { useRef, useState } from 'react'
import { AppSettingsView } from '../../../../molecules/Apps/AppSettingsView'
import { DialogLauncher, KomootLoginDialog } from '../../../../molecules'
import { useAppsService } from 'incyclist-services'
import { useUnmountEffect } from '../../../../../hooks'

const SERVICE = 'komoot'

/**
 * Reports the changes of the operations that were made while the settings were open (other services are interested in them).
 *
 * @param prev settings when the panel was opened
 * @param current settings when the panel is closed
 */
const syncOperations = (service, prev, current) => {
    const prevOperations = prev?.operations ?? []
    const currentOperations = current?.operations ?? []

    if (prev?.isConnected && !current?.isConnected) {
        prevOperations.forEach(op => { service.enableOperation(SERVICE, op.operation, false, true) })
    }
    else if (!prev?.isConnected && current?.isConnected) {
        currentOperations.filter(op => op.enabled).forEach(op => { service.enableOperation(SERVICE, op.operation, true, true) })
    }
    else if (current?.isConnected) {
        currentOperations.forEach((op, idx) => {
            if (op.enabled !== prevOperations[idx]?.enabled)
                service.enableOperation(SERVICE, op.operation, op.enabled, true)
        })
    }
    // not connected when opened and not connected when closed (e.g. connected and disconnected again): nothing has changed
}

export const KomootSettings = ()=> {

    const [connecting,setConnecting] = useState(false)
    const service = useAppsService()
    const dialogLauncher = useRef(null)
    const initialSettingsRef = useRef(service.openAppSettings(SERVICE))
    const [settings,setSettings] = useState(initialSettingsRef.current )
    

    const openDialog = ( Dialog,props)=> {
        dialogLauncher.current.openDialog(Dialog,props)
    }
    const closeDialog = ( )=> {
        dialogLauncher.current.closeDialog()
    }

    const onConnect = async ()=>{        
        openDialog(KomootLoginDialog,{onCancel:onLoginCancel,onOK:onLoginOK})
        setConnecting(true)
    }

    const onLoginOK = (credentials,cb)=> {

        service.connect('komoot',credentials)
            .then( connected => {
                if (connected) {
                    closeDialog()
                    setConnecting(false)
                    setSettings(service.openAppSettings(SERVICE))
                }
                else {                   
                    cb( 'Invalid credentials')
                }
            })
            .catch(err => {
                cb(err.message)
            })

    }

    const onLoginCancel = ()=> {
        closeDialog()
        setConnecting(false)
    }

    const onDisconnect = ()=>{
        service.disconnect(SERVICE)
        setSettings( current=> ({...current, isConnected:false}))
    }

    const onOperationsChanged = (operation, enabled) => {
       
        const operations = service.enableOperation(SERVICE,operation,enabled)
        
        setSettings( current=> ({...current,operations} ))
    }

    useUnmountEffect( ()=>{
        syncOperations(service, initialSettingsRef.current, settings)
    })

    return <>
            <DialogLauncher ref={dialogLauncher}/>
            <AppSettingsView {...settings} name='Komoot' isConnecting={connecting}
                onConnect={onConnect} onDisconnect={onDisconnect}
                onOperationsChanged={onOperationsChanged}
            />
        </>
}
