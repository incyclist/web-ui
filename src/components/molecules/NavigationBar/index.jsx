import React, { useRef } from "react";
import styled, { withTheme } from "styled-components";
import {Icon,Column,RouteIcon,Row, WorkoutIcon,UserIcon,ExitIcon, SettingsIcon, ActivityIcon, Autosize } from '../../atoms'
import { useKey } from "../../../hooks";
import { AppThemeProvider } from "../../../theme";
import { SearchIcon as SearchIconReact } from "@primer/octicons-react";
import { DialogLauncher } from "../dialogs";
import { UserSettingsDialog,SettingsDialog } from "../../modules/Settings";
import { useNavigate } from "react-router";
import { copyPropsExcluding } from "../../../utils/props";
import { useAppUI } from "../../../bindings/native-ui";
import { BikeIcon } from "../../atoms/Icons/BikeIcon";
import { useAppState } from "incyclist-services";

const Container = styled(Column)`
    width: ${props=>props.width|| '200px'};
    position:relative;
    height: 100%;
    overflow: hidden;
    background: rgba(0,0,0,0.2);
    padding:0;
    margin:0;
`

const SearchIcon = (props) => {
    const childProps = copyPropsExcluding(['color','width', 'height', 'size'])
    return <SearchIconReact fill={props.color} size={50} {...childProps}/>
}



const PageIcon = withTheme((props) => {
    const childProps = {...props}
    const {selected} = props;
    const theme = props.theme?.navbar;

    delete childProps.selected
    
    childProps.color = selected ? theme?.selected.text : theme?.normal.text
    childProps.background = selected ? theme?.selected.background : theme?.normal.background
    return         <Icon {...childProps}/>
})


export const NavigationBarComponent = ( {hidden,height,width, selected, hotkeysDisabled, onSelected, closePage})=> {

    const cntIcons = 8
    const maxRowHeight = Math.min( Math.floor(height/(cntIcons*10))*10,80)
    const rh = `${maxRowHeight}px`
    const h =maxRowHeight-10;
    
    
    const heightMiddle = `${height-2*maxRowHeight}px`
    const ref = useRef(null)
    const navigate = useNavigate()
    const appState = useAppState()
    
    const ui = useAppUI()

    const onToggleFullScreen = ()=>{
        if (!hotkeysDisabled)
            ui.toggleFullscreen()
    }

    const[enableHotkey,disableHotkey] = useKey( 'f' ,  onToggleFullScreen)

    

    const openDialog = ( Dialog,props)=> {
        disableHotkey()
        ref.current.openDialog(Dialog,props)
    }
    const closeDialog = ( )=> {
        enableHotkey()
        ref.current.closeDialog()
    }

    const openPage = async ( pageName) => {
        if (selected===pageName)
            return;

        try {
            const current = appState.getPersistedState('page')??''

            navigate(`/${pageName}`,{ state: { source: `/${current}` } });
                
            if (closePage)
                closePage()



        }
        catch(err) {
            console.log('# error!',err)
        }

    }


    const onIconSelected =  (page)=> {
        switch (page) {
            case 'user':
                openDialog (UserSettingsDialog,{onOK:closeDialog} )
                break;
            case 'settings':
                openDialog(SettingsDialog,{onOK:closeDialog})
                break;
            case 'devices':
                openPage('devices')
                break;
            case 'route':
                break;
            default:
                openPage(page)
                break;
        }

    };

    if (hidden || height===undefined)
        return null;

    return (
        
        <AppThemeProvider>
            <Container width={width||'150px'}>
                <Row height={rh} width={width||'150px'}   justify='center' padding='10px 0 10px' >
                    <Icon label='User' color='white' width={100} height={h}  class='route'  
                          onClick={()=>{onIconSelected('user')}}> 
                        <UserIcon/>
                    </Icon>

                </Row>
                <Row height={heightMiddle} width={width||'150px'} align='center' justify='center'>
                    
                    <Column>
                        <Row padding='10px 0 10px' >
                            <Icon label='Settings' color='white' width={100} height={h}  className='settings' 
                                onClick={()=>{onIconSelected('settings')}}> 
                                <SettingsIcon/>
                            </Icon>
                        </Row>
                        <Row padding='10px 0 10px' >
                            <PageIcon label='Devices' selected={selected==='devices'} width={100} height={h}  className='devices' 
                                onClick={()=>{onIconSelected('devices')}}> 
                                <BikeIcon/>
                            </PageIcon>
                        </Row>

                        <Row padding='10px 0 10px' >
                            <PageIcon label='Search' selected={selected==='search'} width={100} height={h}  className='search' 
                                onClick={()=>{onIconSelected('search')}}> 
                                <SearchIcon/>
                            </PageIcon>
                        </Row>

                        <Row padding='10px 0 10px' >
                           <PageIcon label='Routes' selected={selected==='routes'} width={100} height={h}  className='route'
                            onClick={()=>{onIconSelected('routes')}}> 
                            <RouteIcon/>
                            </PageIcon>
                        </Row>

                        <Row padding='10px 0 10px' >
                            <PageIcon label='Workouts' selected={selected==='workouts'} width={100} height={h}  className='workout' 
                            onClick={()=>{onIconSelected('workouts')}}> 
                                <WorkoutIcon/>
                            </PageIcon>
                        </Row>

                        <Row padding='10px 0 10px' >
                            <PageIcon label='Activities' selected={selected==='activities'} width={100} height={h}  className='activity' 
                            onClick={()=>{onIconSelected('activities')}}> 
                                <ActivityIcon/>
                            </PageIcon>
                        </Row>

                    </Column>

                </Row>
                <Row height={rh} width={width||'150px'} justify='center' padding='10px 0 10px'>
                    
                    <Icon label='Exit' color='white' width={100} height={h}  class='route' 
                        onClick={()=>{onIconSelected('exit')}}> 
                        <ExitIcon/>
                    </Icon>

                </Row>
                
            </Container>

            <DialogLauncher ref={ref}/>

        </AppThemeProvider>
    )   

}

export const NavigationBar = (props) => {
    return <Autosize width='120px'><NavigationBarComponent {...props} /> </Autosize>

}