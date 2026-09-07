import React from 'react'
import styled from 'styled-components'
import { Autosize } from '../../atoms'
import { ElevationGraphData } from './data'

/**
 * Two stacked colour-coded gradient bands, `Route` above `Smoothed`, sharing one x-axis with the
 * elevation profile above them.
 *
 * Why a second, separate visual rather than a redrawn/second line on the elevation chart: the
 * elevation curve itself barely moves under smoothing (a fraction of a pixel on a real track,
 * within a chart that also resamples to one column per pixel of width) - no colour, weight or
 * draw order recovers a difference that small. The same transform moves the gradient by a factor,
 * so the comparison belongs on that axis instead. Both bands stay on screen together so the
 * before/after reads at a glance without the viewer having to hold the previous state in memory.
 *
 * Reuses the exact column-per-pixel decimation and slope colouring
 * (`ElevationGraphData`/`getColor`) the elevation chart itself uses, so this introduces no new
 * visual vocabulary - same colours, same resampling, just presented as two rows instead of bars
 * under a line.
 */

const Wrapper = styled.div`
    width: 100%;
    opacity: ${props => props.dimmed ? 0.6 : 1};
`

const BandRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
`

const BandLabel = styled.span`
    flex: 0 0 auto;
    min-width: 4.5vw;
    padding-right: 0.4vw;
    font-size: 1.1vh;
    color: #9fa4a8;
`

const BandTrack = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1 1 auto;
    height: ${props => props.height || '8px'};
    overflow: hidden;
`

const BandColumn = styled.div`
    flex: 1 1 0;
    height: 100%;
    background-color: ${props => props.color || 'transparent'};
`

/**
 * Builds one colour column per pixel of the given width - the same decimation
 * `ElevationGraphData.updateGraphData()` performs for the elevation chart itself, driven directly
 * rather than through the `Graph` React lifecycle (there is no position tracking or resize state
 * to manage here, just a one-shot column build).
 */
export const buildGradientColumns = (routeData, width, pctReality) => {
    const pxWidth = Math.max(Math.round(width || 0), 0)
    if (!routeData?.points?.length || !pxWidth) return []

    const data = new ElevationGraphData({})
    data.updateDimensions({ width: pxWidth, height: 1 })
    data.updateRoute({ routeData })
    data.updateGraphData({ pctReality })
    return data.get()
}

const Band = ({ label, columns, height }) => (
    <BandRow>
        <BandLabel>{label}</BandLabel>
        <BandTrack height={height}>
            {columns.map((c, i) => <BandColumn key={i} color={c.color} />)}
        </BandTrack>
    </BandRow>
)

const GradientBandsInner = ({ routeData, smoothedRouteData, width, pctReality, dimmed, bandHeight }) => {
    const routeColumns = buildGradientColumns(routeData, width, pctReality)
    // the Smoothed band's slot is always reserved (see Band above rendering an empty track), and
    // only filled once a level is active - so turning smoothing on/off never changes this
    // container's height or position
    const smoothedColumns = smoothedRouteData ? buildGradientColumns(smoothedRouteData, width, pctReality) : []

    return (
        <Wrapper dimmed={dimmed}>
            <Band label='Route' columns={routeColumns} height={bandHeight} />
            <Band label='Smoothed' columns={smoothedColumns} height={bandHeight} />
        </Wrapper>
    )
}

export const GradientBands = props => <Autosize><GradientBandsInner {...props} /></Autosize>
