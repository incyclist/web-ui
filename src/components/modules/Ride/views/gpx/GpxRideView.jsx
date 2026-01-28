import React from 'react';
import { MapRideView } from "../Map"
import { copyPropsExcluding } from '../../../../../utils';
import { SatelliteRideView } from '../Satellite';
import { GoogleStreetView } from '../../../../molecules/Maps/GoogleStreetView';

export const GpxRideView = (  props ) => { 

        const {rideView} = props??{}
        const childProps = copyPropsExcluding( props??{}, ['rideView','children','onSettingsChanged'])

        const svProps  = copyPropsExcluding(childProps, ['route'])
        //svProps.position = svProps.initPosition

        if (!rideView)
                return null;


        const streetViewPanoramaOptions = {
                disableDefaultUI : true,
                addressControl: false,
                linksControl: false,
                animatedZoom: false,
                navigationControl: false,
                enableCloseButton: false,
                clickToGo: false,
                disableDoubleClickZoom : true,
                fullscreenControl: false,
                imageDateControl : false,
                motionTracking : false,
                motionTrackingControlOptions: false,
                panControl : false,
                //keyboardShortcuts,
                scrollwheel : false,
                zoomControl : false,
                showRoadLabels: false,
                zoom: 1
        };
    

        // we need to avoid that the google views are unmounted, as every mount would require a new API License consumption
        // For that reason we always render them, but with `display:none` in case a different rideView is selected
        return (<>
            {rideView === 'map' ? <MapRideView {...childProps} /> : null}
            <SatelliteRideView {...childProps} visible={rideView==='sat'} />       
            <GoogleStreetView {...svProps} id={'ride'} visible={rideView==='sv'} streetViewPanoramaOptions={streetViewPanoramaOptions} />       
        </>)



}