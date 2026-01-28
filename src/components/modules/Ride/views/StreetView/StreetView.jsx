import React from 'react';
import {GoogleStreetView} from '../../../../molecules/Maps';


export class StreetView  extends React.Component {


    render() {
		let heading = 100;

		if(this.props.position!==undefined) {
			heading = this.props.position.heading;
		}

		if(this.props.heading!==undefined) {
			heading = this.props.heading;
		}
		const keyboardShortcuts = !(this.props.disableKeyboard??false)
		// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#StreetViewPanoramaOptions
		let streetViewPanoramaOptions = {
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
			keyboardShortcuts,
            scrollwheel : false,
            zoomControl : false,
            showRoadLabels: false,
            position: this.props.position,
			pov: {heading, pitch: 0},
			zoom: 1
		};

		return (
			<div style={{
				width: '100%',
				height: '100%',
				backgroundColor: '#eeeeee'
			}}>
				<GoogleStreetView
					direction= { 'front' }  
					googleMaps = {this.props.googleMaps}
					streetViewPanoramaOptions={streetViewPanoramaOptions}					
					{...this.props}
				/>
			</div>
		);
	}

}


