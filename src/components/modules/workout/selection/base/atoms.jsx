import styled from "styled-components";
import { Row } from "../../../../atoms";


export const Title = styled.div`
    width: 100%;
    font-size: 1.75vh;
    font-weight: bold;
    padding-left: 10px;
    padding-top: 1vh;
    height: 3.5vh;
    min-height: 3.5vh;
`
export const DurationText = styled(Row)`
    width: 100%;
    font-size: 1.5vh;
    font-weight: bold;   
    padding: 0 0 5px 10px;
`

export const DateText = styled(Row)`
    width: 100%;
    font-size: 1.5vh;
    font-weight: bold;   
    padding: 0 0 5px 10px;
`

export const DurationLabel = styled(Row)`
    width: 100%;
    font-size: 1.3vh;
    font-weight: bold;   
    padding: 0 0 0 10px;
`

export const Container = styled.div`
    z-index: 0;
    display: flex;
    position: relative;
    flex-direction: column;
    background: ${props=> props.selected?  props.theme.list.selected.background: 'linear-gradient(darkred,#180457)'};
    height: ${props => `${props.height}px`};
    width: ${props => `${props.width}px`};
    user-select: none;

    padding: 0;
    margin: 0;
`
export const ImageContainer = styled.div`
    height: calc(50% - 4.4vh - 20px);
    width: calc(100% - 20px);
    user-select: none;
    padding: 10px;

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
    top: calc(50% - 4.4vh);
    left:0;
    padding: 0;
    margin: 0;
`

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
    width:100%
`;

