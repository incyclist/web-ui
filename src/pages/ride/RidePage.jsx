import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { useRideDisplay, waitNextTick } from "incyclist-services";

import NativeUiService from "../../bindings/native-ui";
import { CyclingModeIndication, DialogLauncher } from "../../components/molecules";
import { usePageLogger, useKey, useUnmountEffect } from "../../hooks";
import { PAGE_ID, cameraSound, WorkoutRidePage } from "./workout/WorkoutRidePage";
import { FollowRouteRidePage } from "./follow-route";
import { copyPropsExcluding } from "../../utils";
import { FreeRideRidePage } from "./free-ride";
import { VideoRidePage } from "./video/VideoPage";
import { MainArea } from "./atoms";
import { Center, Loader } from "../../components/atoms";
import { ActiveRideSettings } from "../../components/modules/Ride/settings";


export const RidePage = ({simulate}) => {

    const ride = useRideDisplay();

    const [state, setState] = useState({ state: 'Idle' });
    const [initState, setInitState] = useState(null);
    const [pageState, setPageState] = useState(null);
    const [logger, closePageLogger] = usePageLogger(PAGE_ID, pageState);


    const refDialogs = useRef(null);
    const refSettingsOpened = useRef(false);
    const refObserver = useRef(undefined)
    const navigate = useNavigate()    
    const location = useLocation()


    const closePage = useCallback(() => {
        closePageLogger();
    },[closePageLogger]);

    const openDialog = useCallback((Dialog, props) => {
        if (!refDialogs.current) {
            const initialized = initState==='initialized'

            logger.logEvent({message: 'component error', component:'Ride page', reason:'no dialog ref',
                    context:{state,initialized, pageState, refSettingsOpened:refSettingsOpened.current}})
            return
        }

        refDialogs.current.openDialog(Dialog, props ?? {});
    },[initState, logger, pageState, state]);

    const closeDialog = () => {

        if (!refDialogs.current)
            return

        refSettingsOpened.current = false;
        refDialogs.current.closeDialog();
    };

    const onBack =useCallback( async () => {
        if (location.state?.source) {
            navigate(location.state?.source)
        }
        else {
            navigate(-1)
        }
        closePage()
    },[navigate])


    // event handlers
    const onStartCancel = async () => {
        // stop listening to state updates (which could trigger re-render)
        const observer = refObserver.current  
        if (observer) {
            observer.stop()
            await waitNextTick()
            refObserver.current = null
        }
        await ride.cancelStart();

        const target = location.state?.source ?? -1
        navigate(target)
        closePage();
        

    };

    const onStartRetry = () => {
        ride.retryStart();
    };

    const onStartIgnore = () => {
        ride.startWithMissingSensors();
    };

    const onNewRide = useCallback(async () => {
        // stop listening to state updates (which could trigger re-render)
        try {
            const observer = refObserver.current
            if (observer) {
                observer.stop()
                await waitNextTick()
                refObserver.current =null
            }
            await ride.stop()
        }
        catch {}

        try {
            const target = location.state?.source ?? -1
            closeDialog();
            navigate(target)
            closePage();
        }
        catch {}

    },[closePage, onBack, ride])

    const onContinueRide = useCallback(() => {
        ride.resume();
        closeDialog();
    },[ride]);

    const onViewChanged = useCallback(() => {
        const newState = ride.getDisplayProperties()
        setState(newState);
    }, [ride]);

    const onExit = useCallback( async () => {
        logger.logEvent({ message: 'App exit requested' });

        // stop listening to state updates (which could trigger re-render)
        const observer = refObserver.current
        if (observer) {
            observer.stop()
            await waitNextTick()
            refObserver.current =null
        }

        await ride.stop();
        closeDialog();
        closePage()
        logger.logEvent({ message: 'App exit complete' });

        window.onbeforeunload = null;
        NativeUiService.getInstance().quit();
    },[closePage, logger, ride])

    const onToggleFullScreen = () => {
        try {
            NativeUiService.getInstance().toggleFullscreen();
        }
        catch (err) {
            logger.logEvent({ message: 'error', fn: 'onToggleFullScreen', error: err.message, stack: err.stack });
        }
    };

    const onFreeRideOptionSelected = (option) => {
     
        const options = ride.selectFreeRideOption(option);
        setState( current=> ({...current, options}) )
    }

    const onTakeScreenShot = async () => {
        cameraSound.play();
        ride.takeScreenshot();
    };

    
    const onCyclingModeToggled = useCallback( (mode, request) => {
        openDialog(CyclingModeIndication, { mode, delay: 3000, onHidden: closeDialog, ...request });
    },[openDialog]);

    const getRideType = ()=> {
        return ride.getRideType()
    }

    const selectPage = ()=> {
        switch (getRideType()) {
            case 'Workout': return WorkoutRidePage;
            case 'GPX': return FollowRouteRidePage;
            case 'Free-Ride': return FreeRideRidePage;
            case 'Video': return VideoRidePage
            default: 
                logger.logEvent({message:'unknown ride type',rideType:getRideType()})
                onNewRide()
                return null
        }        
    }

    // Hotkeys

    const openSettings = useCallback((rideState) => {

        if (refSettingsOpened.current)
            return;

        if (!rideState|| (rideState !== 'Finished' && rideState !== 'Paused')) {
            ride.pause();
        }

        try {
            refSettingsOpened.current = true;

            // TODO: move this business logic into service ...

            const additionalProps = {};

            let selected = 'Activity';
            let hidden = !state?.route  ? ['Ride', 'Workout', 'Gear','User','Apps','Support'] : ['User','Apps','Support'];
            if (!state?.workout && !hidden.includes('Workout')) {
                hidden.push('Workout');
            }

            if (!rideState && (state?.state === 'Idle' || state?.state === 'Starting')) {
                selected = !state?.route ? 'Workout' : 'Ride' 
                hidden = !state?.route ? ['Activity', 'Ride', 'Gear', 'User','Apps','Support'] : ['Activity', 'Gear', 'User','Apps','Support'];

            }

            if (rideState === 'Finished') {
                selected = 'Activity';
                additionalProps.finished = true;
            }


            // ... end TODO

            const onSettingsChanged = (area,newState) => { 
                ride.onSettingsChanged(area, newState);
            }


            openDialog(ActiveRideSettings, {
                area: selected , hidden, ...additionalProps,
                onSettingsChanged,
                onNew: onNewRide, onExit, onContinue: onContinueRide
            });

        }
        catch (err) {
            logger.logEvent({ message: 'error', fn: 'openSettings', error: err.message, stack: err.stack });
        }

    },[logger, onContinueRide, onExit, onNewRide, openDialog, ride, state.route, state.state, state.workout]);

    const closeSettings = useCallback(() => {
        if (refSettingsOpened.current)
            closeDialog();
    },[]);

    const onPositionUpdate = useCallback( (props)=> {
        const update = copyPropsExcluding( props, ['workout','startOverlayProps','sideViews','options'])
        setState( current => ({...current,...update }))
    },[])

    const onRouteChanged = useCallback( ({route,options,map})=> {
        setState( current => ({...current,route,options,map }))
    },[])
    const onOptionsChanged = useCallback( ({options,map})=> {
        setState( current => ({...current,options,map }))
    },[])

    const openPage = (target) =>{

        const page = target.trim('.')

        if (page.startsWith('/'))
            navigate(page)
        else 
            navigate(`/${page}`)
    }

    
    const onPairing = ()=>{
        openPage('/devices')
    }

    const onToggleCyclingMode = ()=> {
        try {
            ride.toggleCyclingMode()
        }
        catch {}
    }
    const onToggleLeftSideView = ()=> {
        try {
            ride.toggleLeftSideView()
        }
        catch {}
    }
    const onToggleRightSideView = ()=> {
        try {
            ride.toggleRideSideView()
        }
        catch {}
    }



    const ESC = 27;
    const defaultHotkeys = [
        {key: ESC,          handler:()=>openSettings() },
        {key: 'p',          handler:()=>openSettings() },
        {key: 'f',          handler:onToggleFullScreen },
        {key: 'F10',        handler:onTakeScreenShot}, 
        {key: 'c',          handler:onToggleCyclingMode},
        {key: '#',          handler:()=>{ride.stopWorkout()}}, 
        {key: 'h',          handler:()=>{ride.toggleAllOverlays()}},
        {key: 's',          handler:()=>{ride.toggleUpcomingElevation()}},
        {key: 'e',          handler:()=>{ride.toggleTotalElevation()}},
        {key: 'm',          handler:()=>{ride.toggleMap()}},
        {key: 'l',          handler:onToggleLeftSideView},
        {key: 'r',          handler:onToggleRightSideView},
        {key: 'ArrowUp',    handler:(event)=>{ride.onArrowKey(event)}},
        {key: 'ArrowDown',  handler:(event)=>{ride.onArrowKey(event)}},
        {key: 'ArrowLeft',  handler:(event)=>{ride.onArrowKey(event)}},
        {key: 'ArrowRight', handler:(event)=>{ride.onArrowKey(event)}}
    ]


    useEffect( ()=> {
        if (initState)
            return;

        setInitState('init-service')
        ride.init()
            .then( ()=>{
                setInitState('init-service-done')
            })
                
    }, [initState, ride])

    useUnmountEffect( ()=> {
        //console.log('# ride page unmounted')
    })


    useEffect(() => {
        if (initState!=='init-service-done')
            return;

        setInitState('init-observer')
        try {
            let observer = refObserver.current = ride.getObserver();


            if (!observer) {

                ride.init();
                observer = refObserver.current = ride.getObserver();

                if (!observer) {
                    onBack();
                }
                return;
            }
            observer.on('state-update', (newState) => {
                const props = ride.getDisplayProperties();
                if (props.state === 'Finished' || props.state === 'Paused') {
                    openSettings(props.state);
                }
                else if (props.state === 'Active') {
                    closeSettings();
                }


                setState(current => ({ ...current, ...props }));
            })
            .on('position-update', onPositionUpdate)
            .on('overlay-update', (props) => setState(current => ({ ...current, ...props })))           
            .on('workout-update', (workout) => { setState(current => ({ ...current, workout })); })
            .on('cycling-mode-toggle', onCyclingModeToggled)
            .on('view-changed',onViewChanged)
            .on('route-update',onRouteChanged)
            .on('options-update',onOptionsChanged);

            // TODO: 
            // window.onbeforeunload = this.onAppClose.bind(this)
            setState(ride.getDisplayProperties());
            ride.start( simulate);
        }
        catch (err) {
            logger.logEvent({ message: 'error', fn: 'useEffect init', error: err.message, stack: err.stack });
        }
        setPageState('opened');
        setInitState('initialized')

    }, [closeSettings, initState, logger, onBack, onCyclingModeToggled, onOptionsChanged, onPositionUpdate, onRouteChanged, onViewChanged, openSettings, ride, simulate]);

    // page and dialog helpers
    const disabled = state.disabledHotkeys
    const hotkeys = disabled ? defaultHotkeys.filter( h => !disabled.includes(h)) : defaultHotkeys

    useKey(
        hotkeys.map(h=>h.key),
        hotkeys.map(h=>h.handler),
        { logger,propagate:true });

    const initialized = initState==='initialized'


    if (!initialized) {
        return <MainArea>
            <Center><Loader/></Center>
        </MainArea>

    }
    if (pageState==='closed') {
        return null;
    }


    const Page = selectPage()
    if (!Page) {
        logger.logEvent({message: 'component error', component:'Ride page', reason:'unknown page type',state})
        return null;
    }

    return <>
        <Page {...state} initialized={initialized}
            onStartCancel={onStartCancel}
            onStartRetry={onStartRetry}
            onStartIgnore={onStartIgnore}
            onSettings={openSettings}
            onScreenshot={onTakeScreenShot} 
            onFreeRideOptionSelected={onFreeRideOptionSelected}    
            onBack={onBack}
            onPairing={onPairing}
            logger={logger}        
            />
        <DialogLauncher ref={refDialogs} />
    </>;

};
