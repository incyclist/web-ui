import { useAppsService } from "incyclist-services"
import React,{ useEffect, useState } from "react"
import styled from "styled-components";
import { AppThemeProvider } from "../../../../theme";
import { Row  } from "../../../atoms";
import { AppsItem } from "../../../molecules/Apps/AppsItem";
import { StravaSettings } from "./Strava";
import { VeloHeroSettings } from "./VeloHero/VeloHeroSettings";
import { KomootSettings } from "./Komoot/KomootSettings";
import {IntervalsSettings} from './Intervals/IntervalsSettings'


export const ContentArea = styled.div`
    position:relative;
    width: ${props=> props.width || 'calc(100% - 2vw)'};
    // height: ${props=>props.height || 'calc(100% - 2vh)'};
    text-align: left ;
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
    background: ${props => props.background || props.theme.dialogContent.background || 'white'};
`;

const getMapping = (service) => {
    const mapping = {
        strava: StravaSettings,
        velohero: VeloHeroSettings,
        komoot: KomootSettings,
        intervals: IntervalsSettings
    }
    const C = mapping[service]
    return C
}

const SettingsPage = ( {service,onBack} ) => {

    const C = getMapping(service)
    if (!C)
        return null

    return <C onBack={onBack}/>

}


export const AppsSettings = ( ) => {
    const service = useAppsService()
    const [state,setState] = useState(null)

    useEffect( ()=>{
        if (state?.initialized)
            return;

        const apps = service.openSettings()
        

        setState({apps, initialized:true})
    },[service, state])

    const onClick=(key) => {
        setState( current=> ({...current, selected:key}) )
    }

    const onBack=()=>{
        setState( current=> ({...current, selected:null}) )
    }

    if (!state?.initialized )
        return null;

    if (state.selected && getMapping(state.selected))
        return <SettingsPage service={state.selected} onBack={onBack}/>
    
    return <AppsSettingsView apps={state.apps} onClick={onClick}/>
    


}

export const AppsSettingsView = ({apps,onClick}) => {

    const onClickHandler = (name) => {
        if (onClick && typeof onClick==='function') {
            onClick(name)
        }
    }
    
    return (
        <AppThemeProvider>
            <ContentArea>
                { apps?.length ? 
                    apps.map( (app) => <Row key={app.key}>
                        <AppsItem {...app} onClick={()=>onClickHandler(app.key)} />
                    </Row> ) :
                    <Row>No Apps available</Row>
                }

            </ContentArea>
        </AppThemeProvider>
    )
    
}