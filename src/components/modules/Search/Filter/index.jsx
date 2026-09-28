import React from "react"
import { Column, EditNumber, EditText, GroupTitle, Row, SingleSelect } from "../../../atoms"
import { Container } from "./atoms";
import { AppThemeProvider } from "../../../../theme";
import { Label } from "../../../atoms/input/base/EditField";
import { createFilterHandlers, getFilterFieldValue as getValue } from "./handlers";

const EDIT_TIMEOUT = 500

export const SearchFilter = ( props, onFocus ) => {

    //const [filters,setFilters] = useState(props.filters)
    const filters = {...props.filters}

    const { onChange,units} = props;

    const {
        onChangeTitle,
        onChangeDistanceMin, onChangeDistanceMax,
        onChangeElevationMin, onChangeElevationMax,
        onChangeCountry, onChangeContentType, onChangeRouteType, onChangeRouteSource
    } = createFilterHandlers({filters, onChange, units})


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
