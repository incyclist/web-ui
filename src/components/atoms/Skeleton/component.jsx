import styled from 'styled-components'

export const SKELETON_BLOCK_COLOR = 'rgba(255,255,255,0.1)'

/**
 * Flat placeholder block for skeleton (loading) states.
 * Deliberately not animated: skeletons are shown while scrolling through long lists, where a shimmer reads as noise.
 */
export const SkeletonBlock = styled.div`
    flex-shrink: 0;
    background: ${SKELETON_BLOCK_COLOR};
    width: ${props => props.width || '100%'};
    height: ${props => props.height || '100%'};
    margin: ${props => props.margin || 0};
    aspect-ratio: ${props => props.aspectRatio || 'auto'};
    pointer-events: none;
`

/**
 * A skeleton block as a CSS background layer.
 *
 * Allows a skeleton to be drawn on a single element (several comma separated layers in `background`),
 * which keeps the DOM small for lists with thousands of placeholder rows.
 */
export const skeletonBlockLayer = ({left='0', top='0', width, height}) =>
    `linear-gradient(${SKELETON_BLOCK_COLOR},${SKELETON_BLOCK_COLOR}) ${left} ${top} / ${width} ${height} no-repeat`
