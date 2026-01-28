import { EventLogger } from "gd-eventlog";
import { useOnlineStatusMonitoring } from "incyclist-services";
import { useEffect, useRef, useState } from "react";

export const useOnlineStatus = (onStatusChange) => {
  const [online, setOnline] = useState(typeof window !== "undefined" ? window.navigator.onLine : true);
  const logger = useRef( new EventLogger('Incyclist') )
  const [initialized,setInitialized] = useState(false)
  const monitoring  = useOnlineStatusMonitoring()

  useEffect(() => {

    if (initialized)
      return;

    // create event handler
    const handleStatusChange = () => {
      if (onStatusChange && typeof onStatusChange==='function')
        onStatusChange(navigator.onLine)


      monitoring.setOnline(navigator.onLine)
      setOnline(navigator.onLine);
      logger.current.logEvent({message:'online status change',status:navigator.onLine ? 'online':'offline' })
    };

    // listen for online and ofline event
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    monitoring.setOnline(online)
    setInitialized(true)

    // clean up to avoid memory-leak
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, [initialized, monitoring, onStatusChange, online]);

  return online;
};