import styled from "styled-components";
import { Column, Row } from "../../../atoms";

export const ElevationContainer = styled.div`
    z-index:1;
    position: absolute;
    display: block;
    background: none;
    height: ${props => props.height};
    width: 100%;
    top: 75%;
    left:0;
    padding: 0;
    margin: 0;
    opacity: 0.2;
`
export const VideoArea = styled.div`
    width: 100%;
    aspect-ratio: auto 235 / 132;
`
export const Title = styled.div`
    width: 100%;
    font-size: 2.2vh;
    font-weight: bold;
    padding-left: 10px;
    padding-top: 1vh;
    height: 5vh;
    min-height: 5vh;
`
export const DistanceText = styled(Column)`
    width: 100%;
    font-size: 1.5vh;
    font-weight: bold;
    
`
export const ElevationText = styled.div`
    width: 100%;
    font-size: 1.5vh;
    font-weight: bold;
`
export const Container = styled.div`
    z-index: 0;
    display: flex;
    position: relative;
    flex-direction: column;
    background: linear-gradient(darkred,#180457);
    height: ${props => `${props.height}px`};
    width: ${props => `${props.width}px`};
    user-select: none;

    padding: 0;
    margin: 0;
`
export const ImageContainer = styled.div`
    height: 50%;
    width: 100%;
    user-select: none;
`
export const PillContainer = styled(Row)`
    position: absolute;
    top: 0;
    right: 0;
    width: fit-content;    
    padding: 5px;
    z-index: 500;

`

export const DataContainer = styled.div`
    z-index:2;
    user-select:none;
    display: flex;
    position: absolute;
    flex-direction: column;
    justify-content: start;
    text-align: left;
    color: white;
    background: none;
    height: 50%; 
    min-height: 50%;
    width: 100%;
    top: 50%;
    left:0;
    padding: 0;
    margin: 0;
`

export const MapArea = styled.div`
    width: 100%;
    user-select:none;
    aspect-ratio: auto 235 / 132;
    background: lightgrey;
    user-select: none;
`;
export const ButtonContainer = styled(Row)`
    z-index:10;
    position: absolute;
    width: 100%;
    justify-content: center;
    align-items: center;
    background: none;
    bottom:0;
    left:0;
    padding: 0;
    margin: 0;
`;
export const LoaderContainer = styled.div`
    position:absolute;
    display:flex;
    justify-content: center;
    align-items: center;

    left:0;
    top:0;
    height:50%;
    width:100%;
`;

