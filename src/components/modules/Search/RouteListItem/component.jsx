import React from 'react'
import styled from 'styled-components'
import { RouteTileSummaryView } from '../RouteTileSummary/component'

const Skeleton = styled.div`
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 112px;
    flex: 0 0 112px;
    overflow: hidden;
    border: 1px solid #3a3248;
    border-radius: 12px;
    background: #171321;
    &::before {
        content: '';
        position: absolute;
        inset: 0 auto 0 0;
        width: 148px;
        background: #292432;
    }
    &::after {
        content: '';
        position: absolute;
        top: 23px;
        left: 164px;
        width: min(36%, 280px);
        height: 15px;
        border-radius: 4px;
        background: #393244;
        box-shadow: 0 31px 0 -3px #393244;
    }
    @media (max-width: 900px) { &::before { width: 124px; } &::after { left: 140px; } }
`

export const RouteListItemSkeleton = () => <Skeleton data-testid='route-list-item-skeleton' aria-hidden='true' />

export const RouteListItemView = props => <RouteTileSummaryView {...props} layout='list' visible={true} />
