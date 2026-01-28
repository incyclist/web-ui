import React from 'react';
import styled from 'styled-components';

import {PanelItem} from '../../../molecules/Panel'
import { Row } from '../../../atoms';

const PanelArea = styled.div`
    display: content;
    padding: 0;
    margin: 0;
    z-index: ${props => props.zIndex ?? 10};
    background: ${props => props.scheme==='dark' ? 'none' : 'white'};
    color: ${props => props.scheme==='dark' ? 'white' : 'black'};
    border: none;
    width: 100%;
    height: 100%;
`;

const ActivityPanel = styled(Row)`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
`

export const RideDashboard = ({showHeader=true,rows=1,scheme,items=[],id,top,left,width,height})=> {

    const position = {top,left,width,height}

    const cnt = items.reduce( (c,i) => c+(i.size||1),0 )
    const wPct = 100/cnt;
    const panelProps = {  rows, showHeader }

    return (
        <PanelArea id={id} scheme={scheme} className='panel' {...position}>
            <ActivityPanel columns={cnt} className='activity-panel' >
                { items.map( (i)=>(
                    i!=null  ? <PanelItem {...panelProps} key={i.title} width={i.size? `${wPct*i.size}%`: `${wPct}%`} title={i.title} data={i.data} dataState={i.dataState}></PanelItem>:null
                ))}                    
            </ActivityPanel>
        </PanelArea>
    )

}