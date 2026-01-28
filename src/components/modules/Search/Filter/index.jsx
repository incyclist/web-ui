import React from "react"
import { Column, EditNumber, EditText, GroupTitle, Row, SingleSelect } from "../../../atoms"
import { Container } from "./atoms";
import { AppThemeProvider } from "../../../../theme";
import { Label } from "../../../atoms/input/base/EditField";
import { EventLogger } from "gd-eventlog";

const EDIT_TIMEOUT = 500

export const SearchFilter = ( props, onFocus ) => {

    //const [filters,setFilters] = useState(props.filters)
    const filters = {...props.filters}

    const { onChange,units} = props;

    const emitChange = (field,value) => {
        if (JSON.stringify(value)!==JSON.stringify(filters[field]) && onChange) {
            filters[field] = value
            onChange(filters)
        }

    }

    const onChangeTitle = (value)=> {
        const title = value?.length>0 ? value : undefined        
        emitChange('title',title)
    }


    const onChangeDistance = (value,minMax) =>{       
        try {
            const distance = {...(filters.distance||{})}

            if (units?.distance) {            
                const v = Number(value)
                if (value===undefined||value===''||isNaN(v))  {
                    distance[minMax] = undefined
                }
                else {
                    distance[minMax] = {value:v, unit:units.distance}
                }
            }
            else {
                let v; 
                if (typeof(value)==='string') 
                    v = value?.length>0 ? Number(value)*1000 : undefined
                if (typeof(value)==='number')
                    v = value*1000
                distance[minMax] = v
                

            }
            emitChange('distance',distance)
        }
        catch(err) {
            const logger = new EventLogger('Filter')
            logger.logEvent( {message:'error', error:err.message, fn:'onChangeDistance',args:{value,minMax}})
        }
    }

    
    const onChangeDistanceMin = (value) =>{       
        return onChangeDistance(value,'min')
    }

    const onChangeDistanceMax = (value) =>{
        return onChangeDistance(value,'max')

    }

    const onChangeElevation = (value,minMax) =>{
        try {
            const elevation = {...(filters.elevation??{})}
            if (units?.elevation) {            
                const v = Number(value)
                if (value===undefined||value===''||isNaN(v))  {
                    elevation[minMax] = undefined
                }
                else {
                    elevation[minMax] = {value:v, unit:units.elevation}
                }
            }
            else {
                let v; 
                if (typeof(value)==='string') 
                    v = value?.length>0 ? Number(value) : undefined
                if (typeof(value)==='number')
                    v = value
                elevation[minMax] = v

            }
            emitChange('elevation',elevation)
        }
        catch(err) {
            const logger = new EventLogger('Filter')
            logger.logEvent( {message:'error', error:err.message, fn:'onChangeElevation',args:{value,minMax}})
        }

    }


    const onChangeElevationMin = (value) =>{
        onChangeElevation(value,'min')
    }

    const onChangeElevationMax = (value) =>{
        onChangeElevation(value,'max')
    }

    const onChangeCountry = (value)=> {
        const country = value==='All' ?  undefined        : value
        emitChange('country',country)
    }

    const onChangeContentType = (value)=> {
        const contentType = value==='All' ?  undefined    : value
        emitChange('contentType',contentType)
    }

    const onChangeRouteType = (value)=> {
        const routeType = value==='All' ?  undefined        : value
        emitChange('routeType',routeType)
    }

    const onChangeRouteSource = (value)=> {
        const routeSource = value==='All' ?  undefined        : value
        emitChange('routeSource',routeSource)
    }

    const getValue = (v,factor=1)=> {
        try {
            if (v===undefined||v===null)
                return ''
            if (typeof v === 'number') {
                return v*factor
            }
            if (v.value!==undefined && v.unit) {
                return v.value
            }
        }
        catch { /* ignore*/}
        return ''
    }


    const {title,distance,elevation,country='All',contentType='All',routeType='All', routeSource='All'} = filters
    const countries = [...props.countries??[]];
    const contentTypes = [...props.contentTypes??[]]
    const routeTypes = [...props.routeTypes??[]]
    const routeSources = [...props.routeSources??[]]

    countries.unshift('All')
    contentTypes.unshift('All')
    routeTypes.unshift('All')
    routeSources.unshift('All')

    const distanceMin = getValue(distance?.min,1/1000)
    const distanceMax = getValue(distance?.max,1/1000)
    const elevationMin = getValue(elevation?.min)
    const elevationMax = getValue(elevation?.max)

    return <AppThemeProvider>
    <Container className="SearchFilter" >  
        <Row with='100%' margin='0 0 0.5vh 0.5vw'>
            <GroupTitle>Criteria</GroupTitle>
        </Row>

        <Row with='100%'>
            <Column width='50ch' margin ='0 0 0 0.5vw' >
                <Column width='100%' margin ='0 0 0 0.5vw' >
                    <EditText label='Title' labelPosition='before'  labelWidth='16ch'  value={title||''}  timeout={EDIT_TIMEOUT}
                        
                        onTimeout={onChangeTitle }
                        onChange={onChangeTitle } />
                </Column>
                
                <Row margin ='0 0 0 0.5vw' >
                    <Label labelWidth='12ch'>Distance</Label>            
                        <EditNumber  label='min' labelPosition='before'  labelWidth='4ch'  maxLength={5} value={distanceMin}  timeout={EDIT_TIMEOUT} allowEmpty
                            onTimeout={onChangeDistanceMin }
                            onValueChange={onChangeDistanceMin } />
                        <EditNumber  label='max' labelPosition='before'  margin='0 0 0 1ch' labelWidth='4ch'  maxLength={5} value={distanceMax}  timeout={EDIT_TIMEOUT} unit={units?.distance??'km'} allowEmpty
                            onTimeout={onChangeDistanceMax }
                            onValueChange={onChangeDistanceMax } />
                </Row>
                <Row margin ='0 0 0 0.5vw' >
                    <Label labelWidth='12ch'>Elevation</Label>            
                        <EditNumber  label='min' labelPosition='before'  labelWidth='4ch'  maxLength={5} value={elevationMin}  timeout={EDIT_TIMEOUT} allowEmpty
                            onTimeout={onChangeElevationMin }
                            onValueChange={onChangeElevationMin } />
                        <EditNumber  label='max' labelPosition='before'  margin='0 0 0 1ch' labelWidth='4ch'  maxLength={5} value={elevationMax}  timeout={EDIT_TIMEOUT} unit={units?.elevation??'m'} allowEmpty
                            onTimeout={onChangeElevationMax }
                            onValueChange={onChangeElevationMax } />
                </Row>
            </Column>

            <Column width='50ch' margin ='0 0 0 0.5vw' >
                <SingleSelect label='Country' labelPosition='before'  labelWidth='16ch' selected={country} options={countries}  
                    onValueChange={onChangeCountry} />
                <SingleSelect label='Route Content' labelPosition='before'  labelWidth='16ch' selected={contentType} options={contentTypes}  
                    onValueChange={onChangeContentType} />
                <SingleSelect label='Route Type' labelPosition='before'  labelWidth='16ch' selected={routeType} options={routeTypes}  
                    onValueChange={onChangeRouteType} />
                <SingleSelect label='Source' labelPosition='before'  labelWidth='16ch' selected={routeSource} options={routeSources}  
                    onValueChange={onChangeRouteSource} />
            </Column>
        </Row>


    </Container>
    </AppThemeProvider>

}