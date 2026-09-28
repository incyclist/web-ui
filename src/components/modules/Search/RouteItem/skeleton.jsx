import React from 'react'
import styled from 'styled-components'
import { skeletonBlockLayer } from '../../../atoms'
import { AppThemeProvider } from '../../../../theme'
import { Container } from './atoms'

// geometry of the rendered row: 7vh high, thumbnail and elevation preview at 235:132, then title and meta line
const THUMBNAIL_WIDTH = 'calc(7vh * 235 / 132)'
const TEXT_LEFT = 'calc(14vh * 235 / 132 + 2vw)'

// Drawn as background layers on a single element: most rows of a long list are skeletons at any time
const SkeletonRow = styled(Container)`
    opacity: 0.35;
    background:
        ${skeletonBlockLayer({ width: THUMBNAIL_WIDTH, height: '100%' })},
        ${skeletonBlockLayer({ left: TEXT_LEFT, top: '0.75vh', width: '20vw', height: '2vh' })},
        ${skeletonBlockLayer({ left: TEXT_LEFT, top: '4.5vh', width: '12vw', height: '1.5vh' })},
        ${props => props.theme?.pageLists?.background || 'linear-gradient(darkred,#180457)'};
`

/**
 * Placeholder for a route row that is outside the fold.
 *
 * Same box as the rendered row (7vh incl. margin), so the list's scroll height does not change when rows
 * are folded in or out. Flat blocks for thumbnail, title and meta line - no animation.
 */
export const RouteItemSkeleton = ({onClick}) => {
    return (
        <AppThemeProvider>
            <SkeletonRow height={'7vh'} onClick={onClick} data-testid='route-item-skeleton' />
        </AppThemeProvider>
    )
}
