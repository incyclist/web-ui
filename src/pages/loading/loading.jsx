import React,{ PureComponent } from 'react';
import { Center, Loader } from '../../components/atoms';
import ImageBackground from '../../components/atoms/ImageBackground';



export class AppLoadingPage extends PureComponent {
    render() {
        return <ImageBackground>
            <Center>
                <Loader size='15vh' color='white' type='clipped' />
            </Center>
            
            
        </ImageBackground>
    }
}

