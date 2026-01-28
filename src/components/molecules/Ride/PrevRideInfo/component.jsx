import React  from 'react';
import styled from 'styled-components'
import { Center, Column, Row, MaleAvatar as Avatar } from '../../../atoms';

const PanelArea = styled(Row)`
    width: ${props => props.width || '100%'};
    padding: 0px;
    margin: 0px;
    z-index: ${props => props.zIndex!==undefined?  props.zIndex : 10};
    background-color: ${props => props.backgroundColor || 'lightgrey'};
    color: ${props => props.textColor || 'black'};
    position: relative;
`;

const NameInfo = styled.div `	
    height: 2vh;
    text-align: left;
    font-family: "Roboto", "Arial", sans-serif, bold;
    font-size: 1.7vh;
    text-align: left;
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    margin:0px;
    overflow: hidden;
`

const InfoGrid = styled(Row) ` 
    width: 100%;
    height: 2vh;
    min-height: 2vh;
    vertical-align: middle;
    align-items: center;
`
const InfoLine = styled(Column) ` 
    width: ${props => props.width || '100%'};
    font-family: "Roboto", "Arial", sans-serif, bold;
    font-size: 1.3vh;
    text-align: ${props => props.align || 'right'};
    white-space: nowrap;
    overflow: visible;   
`

const DeltaInfo = styled.div ` 
    height: 2vh;
    min-height: 2vh;
    width: ${props => props.width || '100%'};
    font-family: "Roboto", "Arial", sans-serif, bold;
    font-size: ${props => props.large ? '1.7vh' :'1.3vh'};
    text-align: ${props => props.align || 'right'};
    vertical-align: middle;
    align-items: center;
    white-space: nowrap;
    overflow: visible;
`


const AvatarArea = styled(Column)`
    height: 4vh;
    width: 2vw;
    min-width: 2vw;
    z-index: ${props => props.zIndex!==undefined?  props.zIndex : 10};
    position: relative;

`;

const PositionArea = styled(Column)`
    height: 4vh;
    width: 4ch;
    z-index: ${props => props.zIndex!==undefined?  props.zIndex : 10};
    font-size: 1vh;
    padding:0px;
    margin:0px;
    position: relative;


`;

const Middle = styled(Column)`
    flex-grow: 1;
    height: 4vh;
    padding: 0;
    margin: 0;
    z-index: ${props => props.zIndex!==undefined?  props.zIndex : 10};
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Right = styled(Column)`
    width: 7ch;
    height: 4vh;
    padding: 0;
    z-index: ${props => props.zIndex!==undefined?  props.zIndex : 10};
`;




export const PrevRideInfo = ( { distanceGap, timeGap,title,lap, power,speed,heartrate, position,backgroundColor, textColor,avatar} )=> {

    const getDistanceGap = () => {
        
        if (!distanceGap)
            return ''

        if (typeof(distanceGap)==='string')
            return distanceGap

        else if (typeof(distanceGap)==='number' && distanceGap!==undefined && distanceGap!==null && !isNaN(distanceGap)) {
            const prefix = Math.sign(distanceGap)>0 ? '+' :''
            const km = distanceGap/1000;
            const kmDecimals = km>10 ? 0:1;
            return Math.abs(distanceGap) <1000 ? `${prefix}${distanceGap.toFixed(0)} m` : `${prefix}${(distanceGap/1000).toFixed(kmDecimals)} km`;
        }

        else if ( distanceGap.value && distanceGap.unit) {
            const {value,unit} = distanceGap
            const prefix = Math.sign(value)>0 ? '+' :''
            return `${prefix}${value}${unit}`
        }


        return ''
    }

    const getTimeGap = () => {
        if (!timeGap || title==='current')
            return ''

        if (typeof(timeGap)==='string')
            return timeGap

        const prefix = Math.sign(timeGap)>0 ? '+' :''

        if (timeGap!==undefined && timeGap!==null&& !isNaN(timeGap)) {
            if (Math.abs(timeGap) < 0.1) 
                return '';    
            if (Math.abs(timeGap) < 1) 
                return `${prefix}${timeGap.toFixed(1)}s`;
            if (Math.abs(timeGap) < 60) 
                return `${prefix}${timeGap.toFixed(0)}s`;

            const minutes = Math.floor( Math.abs(timeGap) /60);
            const seconds = Math.abs(timeGap) - minutes*60;
            return `${prefix}${minutes}:${seconds.toFixed(0)}`;            
        }
        return ''        
    }

    const getPowerInfo = () =>{

        if (power!==undefined && power!==null) {
            return `${power.toFixed(0)} W`;
        }

        return ''
    }

    const getSpeedInfo = () => {
        if (speed===undefined || speed===null)
            return ''

        if (typeof speed=='number') {
            return `${speed.toFixed(1)} km/h`;
        }
        else if (speed.value!==undefined && speed.unit!==undefined) {
            const {value,unit} = speed
            return `${value} ${unit}`
        }
        return ''
    }

    const isCurrent = (title==='current')
    const name = isCurrent ? 'Current Ride' : title

    return (
        <PanelArea backgroundColor={backgroundColor} textColor={textColor}> 
            <PositionArea className='position'>
                <Center>{position}</Center>
            </PositionArea>
            <AvatarArea className='avatar'><Center><Avatar {...avatar}/></Center></AvatarArea>
            <Middle className='data'>
                <NameInfo>{name}</NameInfo>
                <InfoGrid>
                        <InfoLine width='10ch' align='right'>{getSpeedInfo()}</InfoLine>                            
                        <InfoLine width='7ch' align='right'>{getPowerInfo()}</InfoLine>
                        {heartrate ? <InfoLine width='8ch' align='right'>{heartrate} bpm</InfoLine>:null}
                </InfoGrid>
            </Middle>
            <Right className='gap'> 
                <DeltaInfo align='right' large><b>{getTimeGap()}</b></DeltaInfo>
                <InfoGrid>
                    <InfoLine align='right'>{getDistanceGap() }</InfoLine>                    
                </InfoGrid>
            </Right>
        </PanelArea>
    )
}


