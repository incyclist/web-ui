import React from 'react';
import styled from 'styled-components';
import {FoldableOverlay} from '../../../molecules'
import {Overlay} from '../../../atoms'
import { copyPropsExcluding, mergeProps } from '../../../../utils';

const RidePageArea = styled.div`
    z-index: ${props => props.zIndex??1};
    background:none;
    width: ${props => props.width ?? '100%'};
    height: ${props => props.height ?? '100%'};
    top: ${props => props.top ?? '0'};
    left: ${props => props.left ?? '0'};
    position: absolute;
`;





/**
 * RidePageItems
 *
 * A container component that is supposed to be used as a wrapper around all components (page items) being part of a ride page
 * 
 * If a child element is marked as the main component (`isMain` prop) then this is seen as the main screen
 *    - which is rendered at the lowest z-index
 *    - which will get notification about settings chanegs
 * 
 * All other components will be treated as an overlay. 
 * These can either be `FoldableOverlay` (when `fold` is specified) or the
 * standard `Overlay` component. The component forwards positioning and styling
 * props to children and supports excluding specific props when merging.
 *
 * Props:
 * - children: array|node - child React elements to render (expected as an array)
 * - visible: bool - whether the container should render
 * - zIndex: number - base z-index for rendered items (default: 1)
 * - top/left/width/height: values forwarded to the container
 * - onSettingsChanged: function - callback forwarded to the main child
 */
export const RidePageItems = (props) => {
    const { children, visible=true, zIndex=1, top, left, width, height, onSettingsChanged } = props;
    

    // copy parent props excluding children/visible/zIndex so they can be merged
    const childProps = copyPropsExcluding(props, ['children', 'visible', 'zIndex']);

    if (!visible) return null;

    const childrenArray = React.Children.toArray(children);
    if (!childrenArray?.length) return null;

    return (
        <RidePageArea zIndex={zIndex} className='ridepage-view' top={top} left={left} width={width} height={height}>
            {childrenArray.map((ch, idx) => {
                if (ch?.props?.visible === false || !ch?.type) return null;


                const ChildElement = ch.type;
                const mergedProps = ch.props?.isMain ? copyPropsExcluding(ch.props,['children']) : mergeProps(ch.props || {}, childProps, ['children', 'zIndex']);


                if (mergedProps.isMain) {
                    return (
                        <ChildElement key={idx} {...mergedProps} zIndex={zIndex} onSettingsChanged={onSettingsChanged}>
                            {ch.props.children}
                        </ChildElement>
                    );
                }

                const overlayProps = {...mergedProps}
                const elementProps = mergedProps.addPosition ? {...mergedProps} : copyPropsExcluding(mergedProps, ['top', 'left', 'right', 'bottom', 'width', 'height']);

                if (overlayProps.transparent) {
                    overlayProps.background = 'none';
                    elementProps.background = 'none'
                }

                const OverlayClass = overlayProps.fold ? FoldableOverlay : Overlay;
                return (
                    <OverlayClass key={idx} shadow={false} padding={0} border={''} {...overlayProps}>
                        <ChildElement {...elementProps} zIndex={zIndex}>
                            {ch.props.children}
                        </ChildElement>
                    </OverlayClass>
                );
            })}
        </RidePageArea>
    );
}
