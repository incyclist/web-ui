import React  from 'react';
import styled from 'styled-components'
import { Row, MaleAvatar, CoachAvatar, Column } from '../../../atoms';

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
    margin:${props => props.margin}; 
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




export const RiderInfo = ( {name, diffDistance,diffTime,distance,lap,power,wpower,speed,avatar, isUser=false,width, height, backgroundColor,textColor,zIndex}) =>{


    const formatted = (v, withPrefix=false)=> {
        const {value,unit} = v

        if (withPrefix) {
            const prefix = Math.sign(value)>0 ? '+' :''
            return `${prefix}${value} ${unit}`
        }
        return `${value} ${unit}`
    }


    const getDistanceGapText = (distanceGap) =>{
        try {

            if (distanceGap===undefined || distanceGap===null)
                return ''

            if (typeof distanceGap==='number' ) {
                if (Math.abs(distanceGap) < 1)
                    return ''

                const prefix = Math.sign(distanceGap)>0 ? '+' :''
                
                const km = Math.abs(distanceGap/1000);
                const kmDecimals = km>10 ? 0:1;

                if (Math.abs(distanceGap) <1000) 
                    return `${prefix}${distanceGap.toFixed(0)} m`

                return `${prefix}${(distanceGap/1000).toFixed(kmDecimals)} km`;        
            }

            if (distanceGap.value!==undefined && distanceGap.unit) {
                return formatted(distanceGap,true)
            }

        }
        catch {
            return ''
        }
    }

    const getTimeGapText = (timeGap) =>{
        try {
            const prefix = Math.sign(timeGap)>0 ? '+' :''

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
        catch {
            return ''
        }
    }

    const getDiff = ()=> {
        try {
            
            if (isUser)
                return ''
            
            const valid = (v) => v!==undefined && v!==null && 
                ( (typeof v==='number'  && !isNaN(v)) || 
                ( v.value!==undefined && v.unit!==undefined)
                );

            if (valid(diffDistance)) 
                return getDistanceGapText(diffDistance);    
            else if (valid(diffTime)) 
                return getTimeGapText(diffTime);
            
            return '';
        }
        catch {
            return ''
        }
    }

    const getLapInfo = () => { 
        try {
            if (lap!==undefined && lap!==null) { 
                return `Lap ${lap}`;
            }
            return ''
        }
        catch {
            return ''
        }
    
    }

    const getPowerInfo = () =>{
        try {

            if (mpower!==undefined && mpower!==null) {
                return `${mpower.toFixed(1)} W/kg`;
            }

            if (power!==undefined && power!==null) {
                return `${power.toFixed(0)} W`;
            }

            return ''
        }
        catch {
            return ''
        }

    }
    const getSpeedInfo = ()=> {
        try {
            if (speed===undefined || speed===null) 
                return ''

            else if ( typeof speed === 'number') {
                return `${speed.toFixed(1)} km/h`;
            }
            else if (speed.value!==undefined && speed.unit) {
                return formatted(speed)
            }
        }
        catch { /* ignore*/}
        
        return ''
        
    }

    const getDistance = () => {
        try {
            if (distance===undefined || distance===null)
                return ''
            else if ( typeof distance==='number') {
                const km = distance/1000
                const decimals = km>100 ? 0:1
                return distance ? `${km.toFixed(decimals)} km`: '';
            }
            else if (distance.value!==undefined && distance.unit ) {                
                return formatted(distance)
            }
        }
        catch { /* ignore*/}
        return ''
    }


    const diffText = getDiff();

    const Avatar = avatar?.type==='coach' ? CoachAvatar : MaleAvatar

    return (
        <PanelArea backgroundColor={backgroundColor} textColor={textColor}> 
            <AvatarArea><Avatar {...avatar}/></AvatarArea>
            <Middle>
                <NameInfo>{name}</NameInfo>
                <InfoGrid>
                    <InfoLine width='7ch' align='left'>{getDistance()}</InfoLine>
                    <InfoLine width='7ch' align='left'>{getLapInfo() }</InfoLine>
                    <InfoLine width='8ch' margin='0 1ch 0 0' align='right'>{getPowerInfo()}</InfoLine>
                    <InfoLine width='6ch' align='right'>{getSpeedInfo()}</InfoLine>
                </InfoGrid>
            </Middle>
            <Right> 
                <DeltaInfo align='right' large><b>{diffText}</b></DeltaInfo>
                <InfoLine>&nbsp;</InfoLine>
            </Right>
        </PanelArea>
    )
}


