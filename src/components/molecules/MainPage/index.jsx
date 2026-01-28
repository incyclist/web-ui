import React from 'react';
import ImageBackground from '../../atoms/ImageBackground';
import FullScreenContentArea from '../../atoms/FullScreenContentArea';
import styled from 'styled-components';
import { useWindowDimensions } from '../../../hooks';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
    overflow: hidden;
    width: ${props => props.width ||'100%'};
    height:100%;

`


export const MainPage = ({children}) => {


    const {  width } = useWindowDimensions()
    
    return (
        <Container width={width} >
            <ImageBackground className='main-page' zIndex={0}/>
            <FullScreenContentArea zIndex={1}>
                {children}
            </FullScreenContentArea>

        </Container>
    
    )

}

export default MainPage