import React, { useEffect, useState } from 'react';
import { Route,Routes, MemoryRouter} from "react-router";
import { useIncyclist } from 'incyclist-services';
import {version} from '../package.json'

import {AppLoadingPage,ActivitiesPage,RidePage, PairingPage,RoutesPage,SearchPage,ExitPage,WorkoutsPage} from './pages';
import { UpdateChecker } from './components/modules';
import { MapsApiLoader,MessageBox,MonitorOnlineStatus,MainPage } from './components/molecules';
import { Center, ErrorBoundary, Text } from './components/atoms';
import { useInitAppTheme, usePlatformIntegration } from './hooks';


export const App = ()=> {

    const service = useIncyclist()
    useInitAppTheme()
    const {platform} = usePlatformIntegration()

    const [initialized, setInitialized] = useState(false)
    const [terminating, setTerminating] = useState(false)

    const features = {
        interfaces: '*',
        ble: '*',
        wifi: '*'
    }

    useEffect( ()=> {
        if (initialized)
            return

        const handleBeforeUnload = (event) => {
            // Standard way to trigger the confirmation dialog
            event.preventDefault();
            // Legacy support for older browsers
            event.returnValue = ''; 

            setTerminating(true)
            service.onAppExit()
                .then( (ok)=>{
                    if (ok) {
                        window.removeEventListener('beforeunload', handleBeforeUnload);
                    }
                })            
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        service.onAppLaunch(platform,version,features).then( ()=> {
            setInitialized(true)
        }) 



    },[service])

    if (!initialized) {
        return <AppLoadingPage/>
    }
    if (terminating) {
        return <MainPage>
            <MessageBox noYes noNo title='Incyclist' text='Disconnecting ...' center />
        </MainPage>
    }

    return (
        <ErrorBoundary debug>
            <MonitorOnlineStatus loading={<AppLoadingPage/>}> 
                <MapsApiLoader/>
                <UpdateChecker/>
                <MemoryRouter>
                    <Routes>

                        <Route path="/rideDeviceOK" element={<RidePage rideOnly={true} />} />
                        <Route path="/rideSimulate" element={<RidePage rideOnly={true} simulate={true} />}/>
                        <Route path="/rideOK" element={<RidePage rideOnly={true} routeSelected={true} />}/>
                        <Route path="/rideSkipped" element={<RidePage rideOnly={true} gearSkipped={true} />}/>
                        <Route path="/pairingStart" element={<PairingPage  mode='start'/>} />
                        <Route path="/devices" element={<PairingPage/>} />
                        <Route path="/routes" element={<RoutesPage/>} />
                        <Route path="/search" element={<SearchPage  />} />
                        <Route path="/workouts" element={<WorkoutsPage  />} />
                        <Route path="/activities" element={<ActivitiesPage  />} />
                        <Route path="/start" element={<PairingPage  />} />
                        <Route path="/exit" element= {<ExitPage  />} />
                        <Route path="/" element={<PairingPage  />} >
                        
                        </Route>
                    </Routes>
                </MemoryRouter>            
            </MonitorOnlineStatus>
        </ErrorBoundary>
    
    )

}
