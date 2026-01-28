import React from "react"
import { GoogleStreetView } from "../../../../molecules"

export const SideViewOverlay = ( {direction, position, observer, minimized, foldId})=> {

    const childProps = {position, observer, visible:!minimized, id: foldId??`SideView-${direction}`}

    if (direction==='left')
        childProps.headingOffset = -90
    else if (direction==='right')
        childProps.headingOffset = 90

    childProps.streetViewPanoramaOptions = {
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
        keyboardShortcuts:false,
        panControl : false,
        scrollwheel : false,
        zoomControl : false,
        showRoadLabels: false,
        zoom: 2
    };

    return <GoogleStreetView {...childProps}/>

}