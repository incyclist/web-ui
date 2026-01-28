import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Loader from 'react-spinners/BounceLoader';
import { Video } from '../../../molecules';

const Container = styled.div`
    position:relative;
    background: ${props => props.loaded ? "none": props.background || "lightgrey"};
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

`

const VideoError = styled.div`   
    color: red;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export const VideoPreview = ( {url,previewImg,errorImg,background, onVideoLoaded})=> {

    const [videoError,setVideoError] = useState(null)
    const [loaded,setLoaded] = useState(false)
    const [loading,setLoading] = useState(false)

    useEffect( ()=>{
        if(!loaded)
            setLoading(true)
    },[loaded,loading])

    const onVideoLoadingDone = ( previewImg)=> {
        setLoaded(true)
        setLoading(false)
        if (onVideoLoaded)
            onVideoLoaded(previewImg)
    }

    const onVideoError = (err) => {
        setVideoError(err)
    }

    if (videoError) 
        return (
            <Container loaded={loaded}>                
                <VideoError>{videoError}</VideoError>
            </Container>
        )
    return (
        <Container loaded={loaded} background={background}>
            <Video src={url}
                onLoadingDone={onVideoLoadingDone } onError={onVideoError} > 
                <Loader size='2vh' loading={loading} css={{zIndex:100, position:'absolute', left:'50%', top:'50%'}} />        
            </Video> 

        </Container>
    )


}

