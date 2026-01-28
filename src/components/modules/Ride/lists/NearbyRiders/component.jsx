import React from 'react';
import styled from 'styled-components'
import AppTheme from '../../../../../theme';
import { RiderInfo } from '../../../../molecules/Ride/RiderInfo/rider-info';
import { Dynamic } from '../../../../atoms';
import { copyPropsExcluding } from '../../../../../utils/props';

const listTheme = AppTheme.get().list

const PanelArea = styled.div`
    display: flex;
    flex-direction: column;
    width: ${props => props.width || '100%'};
    height: ${props => `${props.max*4+2}vh`|| '6vh' };
    z-index: ${props => props.zIndex!==undefined?  props.zIndex : 10};
    color: ${props => props.textColor || 'black'};
    background-color: ${props => props.backgroundColor || 'lightgrey'};
`;

const Title = styled.div `	
    height: 3vh;
    width: 100%;
    text-align: left;
    font-family: "Roboto", "Arial", sans-serif, bold;
    font-size: 2vh;
    text-align: center;
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    background-color: ${listTheme.header.background};
    color: ${listTheme.header.text};
`

export const NearbyRidersView = ( {activeRides=[],title,max=10,width,backgroundColors=['black','#363636'],textColors=['white'],zIndex}) => {


    const prepareList = () => { 

        const list = activeRides.map( (item,idx) => {
            if ( !item.backgroundColor) item.backgroundColor = textColors && textColors.length>0 ? backgroundColors[idx % backgroundColors.length] : 'lightgrey';
            if ( !item.textColor) item.textColor = textColors && textColors.length>0  ? textColors[idx % textColors.length] : 'black';

            if (item.isUser) {
                item.backgroundColor = listTheme.selected.background;
                item.textColor = 'black'
            }
            return item;
        })
        return list;
    }

    const list = prepareList();

    if (!list || list.length===0) 
        return null;

    return (
    <PanelArea width={width}> 
        <Title>{title}</Title>
        {list.map((item,index) => <RiderInfo {...item} key={index}/>)}
    </PanelArea>
    );

}

export class NearbyRiders extends React.Component { 



    shouldComponentUpdate( nextProps) {
        return (nextProps.observer!==this.props.observer )
    }

    render() {

        const props = copyPropsExcluding(this.props, ['observer'])
        const {observer} = this.props??{}
        if (!observer)
            return null;

        return <Dynamic observer={observer} event='update' prop='activeRides'>
            <NearbyRidersView {...props} activeRides={[]} />
        </Dynamic>

    }
}

