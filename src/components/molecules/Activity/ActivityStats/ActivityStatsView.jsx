import React, { useState } from 'react';
import {timeFormat} from '../../../../utils/formatting'
import styled from 'styled-components';
import {Column, EditText, FileLink, Icon, Row, View} from '../../../atoms';
import { usePath } from '../../../../bindings/path';
import { PencilIcon, XIcon } from '@primer/octicons-react';
//import path from 'path'

const Title = styled.h2`
    text-align: left;
    font-size: 2vh;
`

const Infoline = styled.div`
    text-align: left;
    width:100%;
    display: inline-flex;
    font-size: 1.5vh;
    margin-bottom: 0.5vh;
`

const Container = styled(View)`
    text-align: left;
    width: 100%;
    height: 100%;
`

const Infofield = (props) => 
    <Infoline>
        <Column style={{textAlign:'left'}} width='35%'>
            <b>{props.label}</b>        
        </Column>
        <Column style={{textAlign:'left'}} width='65%'>
            {props.value}        
        </Column>
    </Infoline>

const Space = (props) => 
    <Infoline>
        <Column style={{textAlign:'left'}} width='100%'>
            &nbsp;
        </Column>
    </Infoline>

const StatsHeader = () => 
    <Infoline>
        <Column style={{textAlign:'left'}} width='35%'>
            &nbsp;
        </Column>
        <Column style={{textAlign:'left'}} width='18%'>
            <b>average</b>     
        </Column>
        <Column style={{textAlign:'left'}} width='18%'>
           <b>min</b>
        </Column>
        <Column style={{textAlign:'left'}} width='18%'>
            <b>max</b>
        </Column>
        <Column style={{textAlign:'left'}} width='11%'>
            &nbsp;
        </Column>
    </Infoline>

const Statsfield = (props) => 
    <Infoline>
        <Column style={{textAlign:'left'}} width='35%'>
            <b>{props.label}</b>        
        </Column>
        <Column style={{textAlign:'left'}} width='18%'>
            {props.format(props.value.avg,false)}        
        </Column>
        <Column style={{textAlign:'left'}} width='18%'>
            {props.format(props.value.min,false)}        
        </Column>
        <Column style={{textAlign:'left'}} width='18%'>
            {props.format(props.value.max,false)}        
        </Column>
        <Column style={{textAlign:'left'}} width='11%'>
            {props.value?.min?.unit??props.value?.max?.unit??props.value?.avg?.unit??props.format('$unit')}        
        </Column>
    </Infoline>


export const ActivityStats = ( {activity, fileLinks,onTitleChange})=> {

    
    const format =( field,value,includeUnit=true) =>{
        if ( value===undefined)
            return ''

        
        let ignoreValue = false;
        let ignoreUnit = !includeUnit; 

        if ( value==='$unit') {
            ignoreValue = true;
            ignoreUnit = false;
        }


        if (value.value!==undefined && value.unit) {
            if (!ignoreValue && !ignoreUnit)
                return `${value.value} ${value.unit}`
            if (ignoreValue)
                return value.unit
            if (ignoreUnit)
                return value.value
        }



        let unit='';
        let val =''
        if ( field==='distance')  {
            unit = ignoreUnit ? '' : 'km';
            val  = ignoreValue? '': Number(value/1000).toFixed(2)
        }
        else if ( field==='speed')  {
            unit = ignoreUnit ? '' : 'km/h';
            val  = ignoreValue? '': Number(value).toFixed(1)
        }
        else if ( field==='time') {
            unit = '';
            val  = ignoreValue? '': timeFormat(Number(value))
        }
        else if ( field==='power')  {
            unit = ignoreUnit ? '' : 'W';
            val  = ignoreValue? '': Number(value).toFixed(0)
        }
        else if ( field==='hrm')  {
            unit = ignoreUnit ? '' : 'bpm';
            val  = ignoreValue? '': Number(value).toFixed(0)
        }
        else if ( field==='cadence')  {
            unit = ignoreUnit ? '' : 'rpm';
            val  = ignoreValue? '': Number(value).toFixed(0)
        }
        else {
            unit = '';
            val  = ignoreValue? '': value
        }
        let space = ignoreUnit || ignoreValue ? '' : ' '
        return `${val}${space}${unit}`
    }

    const [titleEditMode, setTitleEditMode] = useState(false)

    const path = usePath()
    const a = activity || {};
    const stats = a.stats || {}
    const {title,distance,fitFileName,time} = a;


    const onTitleChanged = (newTitle) => {
        setTitleEditMode(false)
        if (onTitleChange)
            onTitleChange(newTitle)
    }

    let fitText;
    try {
        if (fitFileName) {
            const parts = path.parse(fitFileName);
            fitText = `${parts.name}${parts.ext}`
        }
    }
    catch (err) {
        console.log('~~~ ERROR',err)
    }
    return( 
        <Container>
            { titleEditMode ? 
                <Row align='center'>
                    <EditText value={title} onValueChange={onTitleChanged}  />
                        <Icon padding='0' size={16}  onClick={ ()=> {setTitleEditMode(false)}}>
                            <XIcon />
                        </Icon>
                </Row>
            :
            <Row align='center'>

                <Title>{title}</Title>
                {onTitleChange ?
                    <Icon padding='0' size={16} onClick={ ()=> {setTitleEditMode(true)}}>
                        <PencilIcon />
                    </Icon>
                    :null }
            </Row>
            }
            {fitFileName ? 
                <Infoline>
                    <Column  style={{textAlign:'left'}} width='35%'>
                        <b>File</b>        
                    </Column>
                    <Column   style={{textAlign:'left'}} width='65%'>
                        <FileLink text={fitText} src={fitFileName} fontSize='0.9vh' />
                    </Column>

                    
                </Infoline> : null}
                
            <Infofield label='Distance' value={format('distance',distance)} />
            <Infofield label='Time' value={ format('time',time)} />
            { (stats.power!==undefined && stats.power.weighted!==undefined) && 
                <Infofield label='Power (weighted)' value={ format('power',stats.power.weighted)} />
            }
            <Space/>
            <StatsHeader/>
            {stats.speed && <Statsfield label='Speed'  format={ (v)=>format('speed',v,false,)} value={ stats.speed}/>}
            {stats.power && <Statsfield label='Power'  format={ (v)=>format('power',v,false)} value={ stats.power}/>}
            {stats.hrm && <Statsfield label='Heart Rate'  format={ (v)=>format('hrm',v,false)} value={ stats.hrm}/>}
            {stats.cadence && <Statsfield label='Cadence'  format={ (v)=>format('cadence',v,false)} value={ stats.cadence}/>}
            
        </Container>
    )
    
}

