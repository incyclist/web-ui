import React, { useState } from 'react'
import styled from 'styled-components'
import { TrashIcon } from '@primer/octicons-react'
import { Autosize, Button, Icon, Loader } from '../../../atoms'
import { sleep } from '../../../../utils/coding'

export const Container = styled.article`
    position: relative;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) 270px minmax(150px, 1fr) 142px;
    align-items: center;
    gap: 16px;
    width: 100%;
    height: 112px;
    flex: 0 0 112px;
    padding: 12px;
    border: 1px solid #3a3248;
    border-radius: 12px;
    background: ${p => p.theme?.pageLists?.background};
    color: ${p => p.theme?.dialog?.text ?? '#f7f5fa'};
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    &:hover, &:focus-within { border-color: ${p => p.theme?.button?.primary?.background}; }
    &:focus-visible { outline: 3px solid ${p => p.theme?.button?.hover?.background}; outline-offset: -3px; }
    button { font-family: inherit; cursor: pointer; }
    button:focus-visible { outline: 3px solid ${p => p.theme?.button?.hover?.background}; outline-offset: 2px; }
    @media (max-width: 1100px) {
        height: 152px;
        flex-basis: 152px;
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
        grid-template-rows: 1fr 1fr;
        gap: 8px 16px;
        > :first-child { grid-column: 1; grid-row: 1; }
        > :nth-child(2) { grid-column: 1; grid-row: 2; }
        > :nth-child(3) { grid-column: 2; grid-row: 1; }
        > :nth-child(4) { grid-column: 2; grid-row: 2; justify-self: end; }
    }
    @media (max-width: 650px) {
        height: 280px;
        flex-basis: 280px;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: 100px 40px 42px 38px;
        gap: 10px;
        > :first-child { grid-column: 1; grid-row: 1; }
        > :nth-child(2) { grid-column: 1; grid-row: 2; }
        > :nth-child(3) { grid-column: 1; grid-row: 3; }
        > :nth-child(4) { grid-column: 1; grid-row: 4; }
    }
`

export const Skeleton = styled(Container)`
    cursor: default;
    overflow: hidden;
    &::before {
        content: '';
        width: 70%;
        height: 15px;
        border-radius: 4px;
        background: #393244;
        box-shadow: 0 25px 0 -3px #393244;
    }
`

export const Identity = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
`

export const Title = styled.h3`
    margin: 0;
    font-size: 17px;
    font-weight: 650;
    line-height: 1.2;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

export const DateTime = styled.time`
    font-size: 12px;
    color: #bfb6ce;
`

export const Stats = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    min-width: 0;
    strong { display: block; font-size: 17px; font-weight: 650; letter-spacing: -.5px; white-space: nowrap; }
    small { display: block; margin-top: 3px; font-size: 10px; color: #bfb6ce; }
    @media (max-width: 650px) { strong { font-size: 14px; } }
`

export const Profile = styled.div`
    min-width: 0;
    height: 42px;
    small { display: block; margin-top: 3px; font-size: 10px; color: #a99db9; }
`

export const Chart = styled.div`
    width: 100%;
    height: 27px;
    overflow: hidden;
`

export const StatusRow = styled.div`
    display: flex;
    gap: 5px;
    min-width: 0;
    overflow: hidden;
    @media (max-width: 650px) { flex-wrap: wrap; }
`

export const UploadStatus = styled.span`
    padding: 4px 7px;
    border-radius: 5px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    color: ${p => p.$success ? '#b2f1cf' : '#f7e0af'};
    background: ${p => p.$success ? 'rgba(18,55,42,.94)' : 'rgba(42,32,32,.94)'};
`

export const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 142px;
`

export const OpenButton = styled(Button)`
    flex: 1 1 auto;
    min-width: 0;
    white-space: nowrap;
`

export const DeleteButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border: 1px solid #5c506a;
    border-radius: 8px;
    background: ${p => p.theme?.button?.secondary?.background};
    color: ${p => p.theme?.button?.secondary?.text};
    &:hover { background: ${p => p.theme?.button?.hover?.background}; }
`

// The legacy RouteItem still uses this hover action.
export const SizedIcon = ({ width, height, logContext, onClick }) => {
    if (width === undefined || height === undefined) return null
    return <Icon id='delete' margin='-2vh 0 0 0 ' padding='5px' size={height}
        width={`${height + 10}px`} height={`${height + 10}px`} onClick={onClick} logContext={logContext}>
        <TrashIcon verticalAlign='middle' />
    </Icon>
}

export const DeleteIcon = ({ visible, onClick, logContext }) => {
    const [loading, setLoading] = useState(false)
    if (!visible) return null
    const onClickHandler = async (...args) => {
        setLoading(true)
        if (typeof onClick === 'function') await onClick(...args)
        else await sleep(500)
        setLoading(false)
    }
    return <Autosize width='3vw' height='3vh'>
        {loading ? <Loader /> : <SizedIcon onClick={onClickHandler} logContext={logContext} />}
    </Autosize>
}
