import React, { useRef, useState } from 'react'
import { AppSettingsView } from '../../../../molecules/Apps/AppSettingsView'
import { DialogLauncher, KomootLoginDialog } from '../../../../molecules'
import { useAppsService } from 'incyclist-services'
import { useUnmountEffect } from '../../../../../hooks'

const SERVICE = 'komoot'

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
        setSettings( {isConnected:false})
    }

    const onOperationsChanged = (operation, enabled) => {
       
        const operations = service.enableOperation(SERVICE,operation,enabled)
        
        setSettings( current=> ({...current,operations} ))
    }

    useUnmountEffect( ()=>{

        const prev = initialSettingsRef.current
        const current = settings

        if (prev.isConnected && !current.isConnected) {
            const {operations} = prev
            operations.forEach( op=> {  service.enableOperation(SERVICE,op.operation,false,true)})
        }
        else if (!prev.isConnected && current.isConnected) {
            const {operations} = current
            operations.forEach( op=> {  
                if (op.enabled)
                    service.enableOperation(SERVICE,op.operation,true,true
                )})
        }
        else {
            const {operations} = current
            operations.forEach( (op,idx)=> {  
                const prevOp = prev.operations[idx]
                if (op.enabled!==prevOp.enabled)
                    service.enableOperation(SERVICE,op.operation,op.enabled,true
                )})

        }
        

    })

    return <>
            <DialogLauncher ref={dialogLauncher}/>
            <AppSettingsView {...settings} name='Komoot' isConnecting={connecting}
                onConnect={onConnect} onDisconnect={onDisconnect}
                onOperationsChanged={onOperationsChanged}
            />
        </>
}
