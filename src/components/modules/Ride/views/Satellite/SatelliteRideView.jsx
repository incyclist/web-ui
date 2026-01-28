import React from 'react';
import styled from 'styled-components';
import {GoogleSatelliteView} from '../../../../molecules/Maps';
import { ErrorBoundary } from '../../../../atoms';

const ViewArea = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    padding: 0;
    margin: 0;
    height: 100%;
    width:100%;
    background-image: url("images/background.jpg");
    background-size: cover;
    z-index:  ${props => props.zIndex };
`;

export class SatelliteRideView extends React.Component {

    render() {

        const {position,googleMaps,visible,options} = this.props;

        const onEvent = (event,data) => {
            if ( this.props.onEvent && typeof(this.props.onEvent)==='function')
                this.props.onEvent(event,data)
        }
    
    
        return(
            <ErrorBoundary hideOnError debug>
                <ViewArea className='satelite'>
                    <GoogleSatelliteView                  
                        position={position} 
                        onEvent = {onEvent}    
                        options = {options}
                        visible = {visible??true}
                        disableKeyboard
                    />
                </ViewArea>  
            </ErrorBoundary>
        )

    }
}
