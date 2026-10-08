import React from 'react'
import styled from 'styled-components'
import Flag from 'react-world-flags'

const Hero = styled.header`
    position: relative;
    display: flex;
    flex: none;
    flex-direction: column;
    justify-content: flex-end;
    gap: .5rem;
    min-height: 64px;
    padding: .65rem 1.2rem;
    overflow: hidden;
    border-bottom: 1px solid rgba(255, 255, 255, .12);
    background: linear-gradient(135deg, #35224d, #142c38);
`

const Eyebrow = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: .5rem;
    color: #d5ccdf;
    font-size: .76rem;
    font-weight: 600;
`

const Title = styled.h2`
    position: relative;
    z-index: 1;
    margin: 0;
    color: white;
    font-size: clamp(1.2rem, 2.2vw, 1.8rem);
    line-height: 1.15;
    text-shadow: 0 2px 12px rgba(0, 0, 0, .65);
`

const Facts = styled.div`
    display: grid;
    flex: none;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    margin: 0;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, .12);
    border-radius: 10px;
    background: rgba(255, 255, 255, .12);
    @media (max-width: 580px) { grid-template-columns: 1fr; }
`

const Fact = styled.div`
    display: flex;
    flex-direction: column;
    gap: .1rem;
    padding: .45rem .8rem;
    background: #201431;
    color: #bbb1c9;
    font-size: .72rem;
    strong { color: white; font-size: 1rem; }
`

const formatMetric = (formatted, raw, divisor, unit, digits) => {
    if (formatted?.value != null && Number.isFinite(Number(formatted.value)))
        return `${formatted.value} ${formatted.unit ?? unit}`
    if (raw != null && Number.isFinite(Number(raw)))
        return `${(Number(raw) / divisor).toFixed(digits)} ${unit}`
    return '—'
}

/** Only the NEW_SEARCH_UI routeList page supplies this presentation to the shared details dialog. */
export const RouteListDetailsHeader = ({ route, totalDistance, totalElevation, routeType,
    isNew, isDemo, cntActive }) => {
    const description = route?.description ?? {}
    const country = description.country?.toUpperCase() === 'UK' ? 'GB' : description.country?.toUpperCase()
    let countryName = country
    try { if (country) countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(country) }
    catch { /* Keep the country code when DisplayNames is unavailable. */ }

    return <>
        <Hero>
            <Eyebrow>
                {country ? <Flag code={country} height='18' alt={countryName} /> : null}
                <span>{countryName || (description.hasVideo ? 'Video route' : 'GPX route')}</span>
                {isDemo ? <span>· Demo</span> : null}
                {isNew ? <span>· New</span> : null}
                {cntActive > 0 ? <span>· {cntActive} live</span> : null}
            </Eyebrow>
            <Title>{description.title || 'Untitled route'}</Title>
        </Hero>
        <Facts aria-label='Route overview'>
            <Fact><span>Total distance</span><strong>{formatMetric(totalDistance, description.distance, 1000, 'km', 1)}</strong></Fact>
            <Fact><span>Total elevation</span><strong id='Elevation'>{formatMetric(totalElevation, description.elevation, 1, 'm', 0)}</strong></Fact>
            <Fact><span>Route type</span><strong>{routeType}</strong></Fact>
        </Facts>
    </>
}
