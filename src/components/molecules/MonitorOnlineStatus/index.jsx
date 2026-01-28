import React, { useEffect, useRef, useState } from "react";
import { EventLogger } from "gd-eventlog";
import { useOnlineStatusMonitoring } from "incyclist-services";


export const MonitorOnlineStatus = ({logger,loading, children} ) => {

    const [online, setOnline] = useState(undefined);
    const loggerRef = useRef( logger ?? new EventLogger('Incyclist') )
    const monitoring  = useOnlineStatusMonitoring()
    const [initialized,setInitialized] = useState(monitoring.isInitialized())

    useEffect(() => {
        if (initialized )
            return;

        // create event handler
        const handleStatusChange = () => {
            monitoring.setOnline(navigator.onLine)
            setOnline(navigator.onLine);
            loggerRef.current.logEvent({message:'online status change',status:navigator.onLine ? 'online':'offline' })
        };

        // listen for online and ofline event
        window.addEventListener("online", handleStatusChange);
        window.addEventListener("offline", handleStatusChange);

        loggerRef.current.logEvent({message:'enabling online status monitoring',status:navigator.onLine ? 'online':'offline' })
        monitoring.initialize(navigator.onLine)
        
        setInitialized(true)
        setOnline(navigator.onLine);

    }, [initialized, monitoring, online]);
    
    if (!initialized || !children) {
        if (!loading)
            return null;
        return <>{loading}</>
    }
    
    return <>{children}</>
}
  


