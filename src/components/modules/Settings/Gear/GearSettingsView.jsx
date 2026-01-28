import React from 'react';
import styled from 'styled-components';
import { Property } from '../../../molecules/Settings';
import { EventLogger } from 'gd-eventlog';
import { AppThemeProvider } from '../../../../theme';


const ContentArea = styled.div`
    position:relative;
    width: calc(100% - 2vw);
    // height: calc(100% - 2vh);
    text-align: left;
    margin:auto;
    display: flex;
    flex-direction:column;
    padding-left: 1vw;
    padding-right: 1vw;
    padding-top: 1vh;
    padding-bottom: 1vh;
    padding:1vw;
    top:0;
    left:0;
    background: ${props => props.theme?.dialogContent?.background || 'white'};
    color: ${props => props.theme?.dialogContent?.text };
`;

const ModeSelection = styled.div`
    font-size: 1.5vh;
    display: flex;
    flex-direction: row;
`


const Label = (props) => {
    return (
        <div style={{ width:'20%', }}>
            {props.children}
        </div>
    )
}
    
const Description = styled.div`
    font-size: 1vh;
    display: flex;
    flex-direction: column;
    min-height: 3vh;
    max-height: 3vh;
    justify-content: center;
    text-align: left;

`


const Header = styled.h2`
    font-size: 2vh;
`


export class GearSettingsView extends React.Component {

    constructor(props){
        super(props)

        this.logger = props?.logger || new EventLogger('Setting');
        this.virtShiftInfoShown = false

    }

    onChangeMode(mode) {    
        try {    
            this.logger.logEvent( {message: 'list item selected',list:'mode',option: mode, eventSource:'user'})

            if (this.props.onChangeMode)
                this.props.onChangeMode(mode)
        }
        catch(err) {
            this.logger.logEvent( {message: 'error',fn:'onChangeMode', error:err.message, stack:err.stack})
        }
    }

    onSettingsChanged(property,value) {
        try {
            if (this.props.onChangeSetting)
                this.props.onChangeSetting(property,value)
        }
        catch(err) {
            this.logger.logEvent( {message: 'error',fn:'onChangeMode', error:err.message, stack:err.stack})
        }
    }

    render() {
        const {disabled, mode, options=[],settings,logger} = this.props??{};
        
        const selected = mode
        const selectedMode = options?.find( o=> o?.getName()===selected)
        const properties = selectedMode?.getProperties() ?? [];

        try {
            const virtShift = properties?.find( p=> p.key==='virtshift')
            if (virtShift && !this.virtShiftInfoShown) {
                this.logger.logEvent({message:'Virtual Shifting options: ',virtshiftOpts: virtShift.options.map(o=>o.key??o).join(',')})
                this.virtShiftInfoShown = true
                
            }
        }
        catch {}
        
        if (disabled || !mode ) 
            return null;
        
        return(
            <AppThemeProvider>
            <ContentArea>
                <div><Header>Bike Preference</Header></div>
                <ModeSelection>
                    <Label>Mode</Label>
                    <select name='mode' id='mode' value={selected} onChange={ (e)=>this.onChangeMode(e.target.value)} > 
                    {options.map( (o,index) => 
                        <option key={index} value={o?.getName()} label={o?.getName()} />
                            
                    )}
                    </select>
                </ModeSelection>
                <Description>
                    {selectedMode? selectedMode.getDescription() : null}
                </Description>

                {properties.map( (p,index) => 
                    <div key={index}> 
                        <Property property={p} noLog logger={logger}value={(settings? settings[p.key]:undefined) || p.default} settings={settings} onChange={ (p,value) => this.onSettingsChanged(p,value)} />
                    </div>
                )}

                <div></div>

            </ContentArea>
            </AppThemeProvider>
        )
    }
}

