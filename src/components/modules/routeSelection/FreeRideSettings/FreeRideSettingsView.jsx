import React from 'react';

import  { Dialog  } from '../../../molecules';
import {RouteSelectorMap} from '../../../molecules/Maps'
import Loader from 'react-spinners/ClipLoader'
import { EventLogger } from 'gd-eventlog';
import { Button,ButtonBar, Column, Row } from '../../../atoms';
import { AppThemeProvider } from '../../../../theme';
import styled from 'styled-components';


export const TabContentArea = styled.div`
    position:relative;
    width: 100%;
    height: 100%;
    text-align: center;
    margin:auto;
    display: flex;
    padding:0;
    top:0;
    left:0;
    height: calc(100% - 14.3vh);
    width: 100%;
    background: ${props => props.theme?.dialogContent?.background || props.background || 'white'};
`;

const MapPlaceholder = styled.div`
    position:relative;
    width: 100%;    
    height: 100%;    
    min-height: 50vh;    

    text-align: center ;
    ` 

export const FreeRideSettingsView = ({
    position,
    options = [],
    loading,
    onCancel,
    onChange,
    onStart
}) => {
    const logger = new EventLogger('FreeRide');
    const [viewport, setViewport] = React.useState(undefined);

    const getDefaultViewPort = () => {
        if (position) {
            return {
                center: [position.lat, position.lng],
                zoom: 14,
            };
        }
    };

    const handlePositionChanged = (pos, props = { eventSource: 'user' }) => {

        console.log('# handlePositionChange', pos,props)
        if (onChange) {
            onChange(pos, props);
        }
    };

    const handleOptionSelected = (option) => {
        if (onStart) {
            onStart(option);
        }
    };

    const handleBack = () => {
        if (onCancel) {
            onCancel();
        }
    };

    const currentViewport = viewport || getDefaultViewPort();

    try {
        return (
            <AppThemeProvider>
                <Dialog
                    id="FreeRideSettings"
                    width="90vw"
                    height="90vh"
                    title="Select Start Position and Direction"
                    fullsize
                    onESC={handleBack}
                >
                    <div style={{ width: '100%', height: '100%' }} className="dialog-content">
                        {loading ? (
                            <div style={{ position: 'absolute', left: '50%', top: '50%', zIndex: 1000 }}>
                                <Loader color={position ? 'black' : 'white'} loading={true} size={'4vh'} />
                            </div>
                        ) : null}

                        <TabContentArea style={{ textAlign: 'left' }}>
                            <Column width="96%" padding="0 2% 0 2%">
                                <Row className="map-container" height="96%" padding="2% 0 2% 0">
                                    {position ? (
                                        <RouteSelectorMap
                                            zIndex={10}
                                            position={position}
                                            viewport={currentViewport}
                                            routes={options ?? []}
                                            onPositionChanged={(pos, props) => handlePositionChanged(pos, props)}
                                            onViewportChanged={(v) => setViewport(v)}
                                        />
                                    ) : (
                                        <MapPlaceholder />
                                    )}
                                </Row>
                            </Column>
                        </TabContentArea>

                        <ButtonBar justify="center" className="button-bar">
                            {onCancel ? <Button text={'Cancel'} onClick={handleBack} /> : null}

                            {options?.length > 0
                                ? options.map((option, index) => (
                                      <Button
                                          key={index}
                                          onClick={() => handleOptionSelected(option)}
                                          text={option.text}
                                          background={option.color || 'blue'}
                                      />
                                  ))
                                : null}
                        </ButtonBar>
                    </div>
                </Dialog>
            </AppThemeProvider>
        );
    } catch (err) {
        logger.logEvent({
            message: 'error',
            fn: 'FreeRideSettingsView.render',
            error: err.message,
            stack: err.stack,
        });
        return <div style={{ width: '100%', height: '100%' }} />;
    }
};
