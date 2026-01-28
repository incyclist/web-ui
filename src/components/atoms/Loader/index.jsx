import React from "react"
import ClipLoader from "react-spinners/ClipLoader"
import BounceLoader from "react-spinners/BounceLoader"
import { Column } from "../layout"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styled from "styled-components";
import AppTheme from "../../../theme";
import { copyPropsExcluding } from "../../../utils/props";

const ProgressContainer = styled(Column)`
    
    height: ${props => props.size};
    aspect-ratio : 1 / 1;
`

export const Loader= (props) => {
    const {size,color='white',type='clip',progress} = props;

    const pct = Number(progress).toFixed(0)
    const pctText = isNaN(pct) ? '' : `${pct}%`
    const theme = AppTheme.get()

    if (progress) {
        const style =  {
            text: {
                // Text color
                fill: 'white',
                // Text size
                fontSize: size || '1.6vh'
            },
            path: {
                // Path color
                stroke: theme.button.normal.background || 'green',
            }

        }
        return <ProgressContainer size={size}>
            <CircularProgressbar value={progress} text={pctText} styles={style}
            />
        </ProgressContainer>
    }

    const LoaderComponent = type==='clip' ? ClipLoader : BounceLoader
    const childProps = copyPropsExcluding(props,  ['size','color','progress']  )

    return (
            
        <LoaderComponent size={size} color={color} {...childProps}  />                                
            
    )
    
    
}