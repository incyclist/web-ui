import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AppThemeProvider } from '../../../../theme';
import { EditNumber, EditText, SingleSelect } from '../../../atoms';
import { ImgField } from './ImgField';
import { useUserSettings, useUserSettingsDisplay } from 'incyclist-services';
import { useUnmountEffect } from '../../../../hooks';

export const ContentArea = styled.div`
    position:relative;
    width: ${props=> props.width || 'calc(100% - 2vw)'};
    height: ${props=>props.height || 'calc(100% - 2vh)'};
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

export const UserSettings = ( {width, height,onChange  })=>{
    
    const service = useUserSettingsDisplay()
    const [props,setProps] = useState(null)

    useEffect( ()=> {
        if (props)
            return

        const observer = service.open()
        observer.on( 'units-changed', (updated)=> {
            setProps(updated)
        })
        observer.on( 'changed', (updated)=> {
            if (typeof onChange === 'function') {
                onChange(updated)
            }        
        })
        setProps( service.getDisplayProps() )
    },[onChange, props, service])

    useUnmountEffect( ()=> {
        service.close()
    })


    if (!props) {
        return <UserSettingsView width={width} height={height} loading />
    }

    return <UserSettingsView width={width} height={height} {...props} />

}


export const UserSettingsView = ( { imageUrl, username, weight, ftp, units, unitsOptions, width,height, 
        onChangeWeight,onChangeFtp,onChangeName,onChangeUnits }) => {


    const setFtp = (newFtp) => {

        const change = (v) => {
            if (!onChangeFtp || typeof onChangeFtp!=='function')
                return
            onChangeFtp(v)
        }

        if (newFtp===null || newFtp===undefined || newFtp==='') {
            change( null)          
            return
        }

        if (isNaN(newFtp))
            return;
        if ( newFtp>999)
            return;

        change(newFtp??null)
    }

    const setWeight = (newWeight) => {

        const change = (v) => {
            if (!onChangeWeight || typeof onChangeWeight!=='function')
                return
            onChangeWeight(v)
        }

        if (newWeight===null || newWeight===undefined || newWeight==='') {
            change( null)         
            return
        }

        if (isNaN(newWeight))
            return;
        if ( newWeight>999)
            return;

        change(newWeight)
    }

    const setName = (newName) => {

        const change = (v) => {
            if (!onChangeName || typeof onChangeName!=='function')
                return
            onChangeName(v)
        }

        if (newName===null || newName===undefined || (typeof newName==='string' && newName.trim()==='') ) {
            change( null)         
            return;
        }
        change( newName??null )         
    }

    const setUnits = (newUnits) => {
        if (onChangeUnits && typeof onChangeUnits==='function')
            onChangeUnits(newUnits)
    }
    
    
    const common = {labelPosition:'before', labelWidth:'10ch' }

    

    return (
        <AppThemeProvider>
            <ContentArea className='user-settings' width={width} height={height}>                   
                {imageUrl && <ImgField label='Image' value={imageUrl}/>} 
                <EditText label='Name' onValueChange={ setName} value={username} allowEmpty {...common} />
                <EditNumber label='FTP' onValueChange={ setFtp} digits={0} max={999} value={ftp} unit='W' {...common} allowEmpty />
                <EditNumber label='Weight' onValueChange={ setWeight} digits={1} max={999} allowEmpty value={weight?.value} unit={weight?.unit??'kg'} {...common} />            
                {units? <SingleSelect label='Units' onValueChange={setUnits} options={unitsOptions} selected={units} {...common} /> : null}
            </ContentArea>
        </AppThemeProvider>
    )

}


