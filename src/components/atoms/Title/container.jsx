import styled from 'styled-components';
import { copyPropsExcluding } from '../../../utils';



export const ContainerTitleDiv = styled.div`    
    color: white;
    z-index:${props => props.zIndex}
    font-size: ${props=>props.size ? props.size :'6vh'};
    text-transform: uppercase;
    font-weight: ${props=>props.fontWeight};
    width:100%;
    height: calc( ${props=>props.size} + 1vh );
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    text-align: center;
    vertical-align: middle;
`

export const ContainerTitle= (props) => {
    const filtered = copyPropsExcluding(props,['bold'])
    const fontWeight = props.bold? 'bold': 'normal'
    const childProps = {...filtered,fontWeight}

    return <ContainerTitleDiv {...childProps}/>

}