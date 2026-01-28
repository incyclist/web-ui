import React from "react"
import { Video,AutoConvertVideo } from "../../../../molecules"
import { Loader } from "../../../../atoms"
import styled from "styled-components"

export const View = styled.div`
    display: ${props => props.hidden ?  'none' : 'block'  };
    width: ${props => props.width ?? '100%'};
    height: ${props => props.height ?? '100%'};
` 
export class VideoRideView extends React.Component {

    shouldComponentUpdate(nextProps, nextState) {
        // console.log('VideoRideView should update', nextProps, nextState)
        return (this.props.src !== nextProps.src || this.props.hidden !== nextProps.hidden) 
    }

    render() {
        const { src, hidden, ...rest } = this.props;

        if (!src)
            return <Loader />;

        const VideoComp = this.props?.autoConvert ? AutoConvertVideo : Video

        return (
            <View hidden={hidden} className="video-ride-view ">
                <VideoComp {...rest} src={src} width='100%' height='100%'/>
            </View>
        );
    }
}

