import React from 'react';
import { Row, Column, Image } from '../../../atoms';

export const ImgField = (props) => <Row>
    <Column height='5vw' width={'10ch'} justify='center'>
        {props.label}
    </Column>
    <Column height='5vw' width='5vw'>
        <Image src={props.value} width='5vw' height='5vw' circle={true} />
    </Column>
</Row>;
