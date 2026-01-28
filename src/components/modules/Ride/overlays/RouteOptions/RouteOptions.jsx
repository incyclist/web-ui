import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button, AutoHide, ErrorBoundary } from '../../../../atoms';
import { FreeRideOptionButton } from '../../../../molecules';
import { EventLogger } from 'gd-eventlog';
import { useKey } from '../../../../../hooks';

const Popup = styled.div`
    position: absolute;
    top: 0vh;
    left: 6vw;
    padding: 0;
    margin: 0;
    height: 100%;
    width: 85%;
    z-index: ${(props) => (props.zIndex !== undefined ? props.zIndex : 100)};
    display: table;
    margin: auto;
`;

const Info = styled.div`
    text-align: left;
    font-size: 2.2vh;
    margin-left: 1vw;
`;

const ButtonArea = styled.div`
    position: absolute;
    top: 0vh;
    left: 0;
    height: 10vh;
    width: 10vw;
    border: rgb(0, 0, 0) 0px;
    z-index: ${(props) => (props.zIndex !== undefined ? props.zIndex : 100)};
    display: grid;
    margin: auto;
`;

const ImgWhite = styled.img`
    max-width: 100%;
    fill: ${(props) => props.fill || 'white'};
    max-height: 100%;
    filter: brightness(0) invert(1);
`;

const SettingsButton = styled(Button)`
    background-color: ${(props) => props.color || 'black'};
    fill: ${(props) => props.fill || 'black'};
    border-color: ${(props) => props.borderColor || 'lightgrey'};
    position: relative;
    float: left;
    display: flex;
    margin-bottom: 0;
    font-weight: normal;
    text-align: center;
    vertical-align: middle;
    touch-action: manipulation;
    cursor: pointer;
    white-space: nowrap;
    padding: 0.5vh;
    width: ${(props) => props.size};
    height: ${(props) => props.size};
    font-size: 2.2vh;
    border-radius: 8px;
    user-select: none;
    margin: 1vh;
    opacity: ${(props) => props.opacity};
`;

export const RouteOptions = ({
    screenshot,
    settings,
    turn,
    isNearby,

    enforcedVisible,
    distance,
    options,
    heading,
    pinned,
    optionsDelay,
    id,

    onOptionsVisibleChanged,
    onOptionSelected,
    onScreenshot,
    onSettings,
    onTurn
}) => {

    const logger = new EventLogger('RouteOptions');
    const optionsViewRef = useRef(null);
    const optionsRef = useRef(options);
    


    const getOptionColor = (pathInfo) => {
        if (!pathInfo) return;
        return pathInfo.selected ? 'green' : pathInfo.color;
    };

    const getDistance = () => {
        if (typeof distance == 'number') {
            if (distance === undefined) return;
            return distance < 1000
                ? `${Math.round(distance)}m`
                : `${(Number.parseFloat(distance) / 1000).toFixed(1)}km`;
        }
        else {
            return `${distance.value}${distance.unit}`
        }
    };

    const handleOptionSelected = (id) => {
        if (onOptionSelected) {
            onOptionSelected(id);
        }
    };

    const handleScreenshot = () => {
        if (typeof onScreenshot === 'function') {
            onScreenshot();
        }
    };

    const handleSettings = () => {
        if (typeof onSettings === 'function') {
            onSettings();
        }
    };
    const handleTurn = () => {
        if (typeof onTurn === 'function') {
            onTurn();
        }
    };


    const onKeyPressed = (event) => { 
        try {
            const key = event.key;
            if  (key==='0') {
                if (optionsViewRef.current)
                    optionsViewRef.current.show(true);
            }

            else if ('123456789'.includes(key)) {

                if (optionsViewRef.current?.isHidden())
                    optionsViewRef.current.show(true);
            

                const idx = Number(key)-1
                if (options?.[idx]) {
                    handleOptionSelected(options[idx].id)
                }
                
            }
        }
        catch(err) {
            logger.logEvent( {message:'error',fn:'onKeyPressed', key: event.key, error: err.message, stack: err.stack})
        }
    }

    useEffect(() => {
        if (!optionsViewRef.current || !isNearby) { 
            return;
        }

        const optionsView = optionsViewRef.current;
        if (optionsView.isHidden()) {
            optionsView.show(true);
        } 
    },[isNearby, optionsViewRef]);
        
    useEffect(() => {
        if (optionsRef.current===options ) { 
            return;
        }

        if (!options || options.length === 0) {
            if (optionsViewRef.current && !optionsViewRef.current.isHidden()) {
                optionsViewRef.current.hide(true);
            }
            return;
        }
        else if (optionsViewRef.current ) {
            optionsViewRef.current.show(true);
            
        }


        optionsRef.current = options;

    },[options, optionsViewRef, optionsRef]);


    useKey(['0','1','2','3','4','5','6','7','8','9'],onKeyPressed,{logger})

    const visible = options !== undefined && options.length > 0;

    return (
        <ErrorBoundary hideOnError>
            <AutoHide
                ref={optionsViewRef}
                id={id}
                pinned={isNearby || enforcedVisible || pinned}
                delay={optionsDelay ?? 3000}
                onChangeVisible={onOptionsVisibleChanged}
            >
                <Popup>
                    {visible && distance && (
                        <Info>
                            {isNearby
                                ? `Crossing in ${getDistance()}`
                                : `Next in ${getDistance()}`}
                        </Info>
                    )}

                    {visible &&
                        options.map((pathInfo, index) => (
                            <FreeRideOptionButton
                                hotkey={index < 9 ? `${index + 1}` : undefined}
                                id={index < 9 ? `Option ${index + 1}` : pathInfo.id}
                                key={pathInfo.id}
                                onClick={() => handleOptionSelected(pathInfo.id)}
                                pathInfo={pathInfo}
                                heading={heading}
                                color={getOptionColor(pathInfo)}
                                size={10}
                            />
                        ))}
                </Popup>
            </AutoHide>
            <AutoHide delay={5000} pinned={pinned}>
                <ButtonArea>
                    {screenshot && (
                        <SettingsButton
                            onClick={handleScreenshot}
                            id="screenshot"
                            color="black"
                            opacity={0.5}
                            fill="white"
                            size="6vh"
                        >
                            <ImgWhite src="images/camera.svg" />
                        </SettingsButton>
                    )}
                    {settings && (
                        <SettingsButton
                            onClick={handleSettings}
                            id="settings"
                            color="black"
                            opacity={0.5}
                            fill="white"
                            size="6vh"
                        >
                            <ImgWhite src="images/settings.svg" />
                        </SettingsButton>
                    )}
                    {turn && (
                        <SettingsButton
                            onClick={() => handleTurn()}
                            color="black"
                            opacity={0.5}
                            fill="white"
                            size="6vh"
                        >
                            <ImgWhite src="images/u-turn.svg" />
                        </SettingsButton>
                    )}
                </ButtonArea>
            </AutoHide>
        </ErrorBoundary>
    );
};

