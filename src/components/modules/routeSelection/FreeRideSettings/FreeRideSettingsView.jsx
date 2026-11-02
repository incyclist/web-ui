import React from 'react';

import  { Dialog  } from '../../../molecules';
import {RouteSelectorMap} from '../../../molecules/Maps'
import Loader from 'react-spinners/ClipLoader'
import { EventLogger } from 'gd-eventlog';
import { Button,ButtonBar, Column, Row } from '../../../atoms';
import { FreeRideDirectionButton, FreeRideDialogButton } from '../../../molecules';
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

const u = (n) => `calc(var(--u, 10px) * ${n})`;

/*
 * Bottom bar: three tracks. Cancel | the choice | an empty mirror of the first track (keeps the choice centred, 
 * shrinks to 0 first). The track of Cancel is never narrower than Cancel, so they can not overlap.
 */
const Bar = styled(ButtonBar)`
    && {
        display: grid;
        grid-template-columns: minmax(max-content, 1fr) minmax(0, auto) minmax(0, 1fr);
        column-gap: ${u(1)};
        align-items: center;
        justify-content: stretch;
        height: auto;
        min-height: ${u(8.4)};
        padding: ${u(0.8)} 2%;
        box-sizing: border-box;
        container-type: inline-size;
    }
`;

const Choice = styled.div`
    grid-column: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${u(0.5)};
    min-width: 0;
    color: #f7f5fa;
`;

const Question = styled.div`
    font-size: max(13px, ${u(1.35)});
    font-weight: 650;
    text-align: center;
`;

const Choices = styled.div`
    display: grid;
    grid-template-columns: repeat(${(p) => p.$cols}, minmax(0, ${u(24)}));
    gap: ${u(0.7)};
    justify-content: center;

    /* 4 options in a narrow bar: 2 x 2, never 3 + 1 */
    ${(p) => p.$cols === 4 && `@container (max-width: 780px) { grid-template-columns: repeat(2, minmax(0, ${u(24)})); }`}
`;

const Loading = styled.div`
    display: flex;
    align-items: center;
    gap: ${u(0.8)};
    font-size: max(13px, ${u(1.35)});
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
                    <div style={{ width: '100%', height: '100%', containerType: 'size', '--u': 'clamp(10px, calc(0.25rem + 1cqmin), 26px)' }} className="dialog-content">
                        {loading ? (
                            <div style={{ position: 'absolute', left: '50%', top: '50%', zIndex: 1000 }}>
                                <Loader color={position ? 'black' : 'white'} loading={true} size={'4vh'} />
                            </div>
                        ) : null}

                        <div style={{ height: 'calc(100% - 6.6vh)', display: 'flex', flexDirection: 'column' }}>
                        <TabContentArea style={{ textAlign: 'left', height: 'auto', flex: '1 1 0', minHeight: 0 }}>
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

                        <Bar className="button-bar">
                            {onCancel ? (
                                <div style={{ gridColumn: 1, justifySelf: 'start', alignSelf: 'end' }}>
                                    <FreeRideDialogButton text="Cancel" onClick={handleBack} />
                                </div>
                            ) : null}

                            {loading && !(options?.length > 0) ? (
                                <Choice>
                                    <Loading>
                                        <Loader color="#f7f5fa" loading={true} size={14} />
                                        Finding the roads at this point…
                                    </Loading>
                                </Choice>
                            ) : null}

                            {options?.length > 0 ? (
                                <Choice>
                                    {options.length > 1 ? <Question>Which way first?</Question> : null}
                                    <Choices $cols={Math.min(options.length, 4)}>
                                        {options.map((option) => (
                                            <FreeRideDirectionButton
                                                key={option.id}
                                                option={option}
                                                single={options.length === 1}
                                                onClick={() => handleOptionSelected(option)}
                                            />
                                        ))}
                                    </Choices>
                                </Choice>
                            ) : null}
                        </Bar>
                        </div>
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
