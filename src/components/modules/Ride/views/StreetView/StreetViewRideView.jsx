import React from 'react';
import styled from 'styled-components';
import {StreetView} from './StreetView';
import { ErrorBoundary } from '../../../../atoms';

const StreetViewArea = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    padding: 0;
    margin: 0;
    height: 100%;
    width:100%;
    background: linear-gradient(to bottom,rgba(128,128,255,1) 0%,rgba(245,245,245,1) 100%);
    z-index:  ${props => props.zIndex };
`;

export class StreetViewRideView extends React.Component {

    render() {
        const {position,googleMaps,visible} = this.props;
        const onEvent = (event,data) => {
            if ( this.props.onEvent && typeof(this.props.onEvent)==='function')
                this.props.onEvent(event,data)
        }
    
        if (visible!==undefined && visible===false) return null;
    
        return(
            <ErrorBoundary hideOnError>
                <StreetViewArea className='streetview'>
                    <StreetView  
                        position={position} 
                        googleMaps= {googleMaps}
                        onEvent = {onEvent}    
                        disableKeyboard
                    />
                </StreetViewArea>  
            </ErrorBoundary>
        )

    }
}
