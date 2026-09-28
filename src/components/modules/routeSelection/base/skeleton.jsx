import React from 'react'
import styled from 'styled-components'
import { Column, SkeletonBlock } from '../../../atoms'

const SkeletonTile = styled(Column)`
    opacity: 0.35;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(darkred,#180457);
`

const SkeletonInfo = styled(Column)`
    width: 100%;
    padding: 1vh 0.5vw;
    box-sizing: border-box;
`

/**
 * Placeholder for a route tile that is outside the fold.
 *
 * Fills the tile's reserved box, so the grid's scroll height does not change when tiles are folded in or out.
 * Flat blocks for preview image, title and meta line - no animation.
 */
export const CardSkeleton = ({onClick}) => {
    return (
        <SkeletonTile onClick={onClick} data-testid='card-skeleton'>
            <SkeletonBlock width='100%' height='auto' aspectRatio='235 / 132' />
            <SkeletonInfo>
                <SkeletonBlock width='70%' height='2vh' />
                <SkeletonBlock width='45%' height='1.5vh' margin='1vh 0 0 0' />
            </SkeletonInfo>
        </SkeletonTile>
    )
}
