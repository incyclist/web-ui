import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import { LinkButton } from '../../../atoms/Buttons/LinkButton';

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_WIDTH = '30vw';
const DEFAULT_LEFT = '35vw';
const DEFAULT_HEIGHT = '30vh';
const DEFAULT_TOP = '35vh';

// Notice variant (with actions): top-centre, just under the dashboard, so that the ride view stays visible
const NOTICE_WIDTH = '50vw';
const NOTICE_LEFT = '25vw';
const NOTICE_TOP = '12vh';
const LINK_COLOR = '#8cc4ff';

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

const NoticeArea = styled(ViewArea)`
    padding-top: 1%;
    padding-bottom: 1%;
`

const NoticeRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1vw;
`

const Actions = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1vw;
`

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

const hasContent = (text, actions) => !!text || (actions?.length ?? 0) > 0

/**
 * Shows a text on top of the ride view for a limited time.
 *
 * With `actions`, it becomes a notice: shown top-centre, with link-style actions and a close button.
 * A notice is identified by `routeDistance` (used as id): while the id does not change, content
 * changes (e.g. the message being replaced by an acknowledgement) neither restart the timer nor
 * log a new 'Infotext shown'.
 *
 * @param {string} props.text           text to be shown
 * @param {number} props.routeDistance  identifies the text; a new value shows the text again
 * @param {Array<{id:string,label:string}>} [props.actions]  link-style actions (notice variant)
 * @param {function} [props.onAction]   called with the id of the action that was clicked
 * @param {function} [props.onClose]    called when the notice was closed (close button or timeout)
 */
export function InfoText(props) {
    const {
        text,
        routeDistance,
        actions,
        onAction,
        onClose,
        zIndex = 5,
        timeout = DEFAULT_TIMEOUT,
        width,
        left,
        height,
        top
    } = props;

    const isNotice = Array.isArray(actions)

    const [state, setState] = useState( {visible:hasContent(text,actions), text } );
    const refTimer = React.useRef(null);
    const logger = new EventLogger('Infotext')
    

    useEffect(() => {
        const changed = isNotice ? routeDistance!==state.routeDistance : (text!==state.text || routeDistance!==state.routeDistance)
        if (changed) {
            if (refTimer.current) {
                clearTimeout(refTimer.current);
                refTimer.current = null;
            }
            if (text!==undefined && text!==null) {
                logger.logEvent({message:'Infotext shown', text, routeDistance})
            }
            setState({ visible: hasContent(text,actions), text,routeDistance });
        }
    }, [text, routeDistance, actions, isNotice, state, logger]);

    if (!state.visible) return false;

    const close = () => {
        if (refTimer.current) {
            clearTimeout(refTimer.current);
            refTimer.current = null;
        }
        logger.logEvent({message:'Infotext closed'})
        setState(current => ({ ...current, visible: false}));
        onClose?.()
    }

    if (!refTimer.current && timeout && timeout > 0) {
        refTimer.current = setTimeout(close, timeout);
    }

    if (isNotice) {
        return (
            <NoticeArea zIndex={zIndex} width={width ?? NOTICE_WIDTH} left={left ?? NOTICE_LEFT} height='auto' top={top ?? NOTICE_TOP}>
                <NoticeRow>
                    <div>
                        {text ? <div>{text}</div> : null}
                        <Actions>
                            {actions.map( (action, i) => <React.Fragment key={action.id}>
                                {i>0 ? <span aria-hidden='true'>·</span> : null}
                                <LinkButton label={action.label} color={LINK_COLOR} onClick={()=>onAction?.(action.id)} />
                            </React.Fragment>)}
                        </Actions>
                    </div>
                    <LinkButton label='✕' ariaLabel='Close' plain color='white' onClick={close} />
                </NoticeRow>
            </NoticeArea>
        )
    }

    const lines = getLines(state.text)
    const styleProps = getStyleProps(lines);

    return (
        <ViewArea
            zIndex={zIndex}
            width={width ?? DEFAULT_WIDTH}
            left={left ?? DEFAULT_LEFT}
            height={height ?? DEFAULT_HEIGHT}
            top={top ?? DEFAULT_TOP}
            {...styleProps}
        >
            {lines.map((line, i) => (
                <div key={i}>{line}<br /></div>
                ))}

        </ViewArea>
    );
}
