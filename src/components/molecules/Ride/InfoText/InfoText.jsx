import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_WIDTH = '30vw';
const DEFAULT_LEFT = '35vw';
const DEFAULT_HEIGHT = '30vh';
const DEFAULT_TOP = '35vh';

const ViewArea = styled.div`
    position: fixed;
    z-index:  ${props => props.zIndex || 5 };
    margin: 0;
    border: rgb(0,0,0) 1px solid;
    -webkit-box-shadow: 5px 5px 15px 5px #000000; 
    box-shadow: 5px 5px 15px 5px #000000;
    background-color: black;
    color: white;
    opacity: 0.9;
    vertical-align: middle;
    text-align: ${props => props.textAlign || 'left'};
    font-size: 1.8vh;
    line-height: 2.7vh;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    padding-left: 2%;
    padding-right: 2%;
    padding-top: 2%;
    padding-bottom: 2%;
    white-space: pre-wrap;
    width: ${props => props.width || DEFAULT_WIDTH};
    left: ${props => props.left || DEFAULT_LEFT};
    height: ${props => props.height || DEFAULT_HEIGHT};
    top: ${props => props.top || DEFAULT_TOP};
`;

const getStyleProps = (lines) => {
    const textAlign = lines.length < 2 ? 'center' : 'left';

    if (lines.length < 3) {
        return { width: DEFAULT_WIDTH, height: '8vh', top: '46vh', left: DEFAULT_LEFT, textAlign };
    } else {
        return {
            width: DEFAULT_WIDTH,
            height: `${lines.length * 2.7}vh`,
            top: `${50 - lines.length * 1.35}vh`,
            left: DEFAULT_LEFT,
            textAlign
        };
    }
}

const getLines = (text) => {
    const lines = []
    
    const l1 = text.split('<br>');
    l1.forEach( (line)=> {
        const l2 = line.split('\n');    
        lines.push(...l2)
    })

    return lines
}

export function InfoText(props) {
    const {
        text,
        routeDistance,
        zIndex = 5,
        timeout = DEFAULT_TIMEOUT,
        width =DEFAULT_WIDTH,
        left = DEFAULT_LEFT,
        height = DEFAULT_HEIGHT,
        top = DEFAULT_TOP
    } = props;

    const [state, setState] = useState( {visible:!!text, text } );
    const refTimer = React.useRef(null);
    const logger = new EventLogger('Infotext')
    

    useEffect(() => {
        if (text!==state.text || routeDistance!==state.routeDistance) {
            if (refTimer.current) {
                clearTimeout(refTimer.current);
                refTimer.current = null;
            }
            if (text!==undefined && text!==null) {
                logger.logEvent({message:'Infotext shown', text, routeDistance})
            }
            setState({ visible: !!text, text,routeDistance });
        }
    }, [text, routeDistance, state, logger]);

    if (!state.visible) return false;

    if (!refTimer.current && timeout && timeout > 0) {
        refTimer.current = setTimeout(() => {
            logger.logEvent({message:'Infotext closed'})

            setState({ ...state,visible: false});
        }, timeout);
    }

    const lines = getLines(state.text)
    const styleProps = getStyleProps(lines);

    return (
        <ViewArea
            zIndex={zIndex}
            width={width}
            left={left}
            height={height}
            top={top}
            {...styleProps}
        >
            {lines.map((line, i) => (
                <div key={i}>{line}<br /></div>
                ))}

        </ViewArea>
    );
}

