import React from "react"
import styled from "styled-components"
import { Column, EditNumber, Row, SegmentedControl, SingleSelect } from "../../../atoms"
import { AppThemeProvider } from "../../../../theme"
import { Label } from "../../../atoms/input/base/EditField"
import { createFilterHandlers, getFilterFieldValue as getValue } from "../Filter/handlers"

const EDIT_TIMEOUT = 500

const Container = styled.div`
    z-index: 0;
    position: relative;
    background: ${props => props.theme?.pageLists?.background};
    user-select: none;
    padding: 1vh 1vw 0 1vw;
    margin-bottom: 1vh;
    color: white;
    width: 100%;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: ${props => props.$singleColumn ? 'minmax(0,1fr)' : 'repeat(3, minmax(0,1fr))'};
    column-gap: 2vw;
`

/** makes sure the selected value is offered, even if the other filters exclude it */
const withSelected = (options, selected) => {
    const list = ['All', ...(options??[])]
    if (selected && !list.includes(selected))
        list.push(selected)
    return list
}

/**
 * The collapsible filter panel of the Routes page - the Search page's criteria (except the
 * title search, which lives in the toolbar), laid out in three columns (one column on narrow
 * windows). Route Content and Route Type are chip rows, Country and Source stay menus.
 */
export const RouteFilterPanel = (props) => {

    const {filters: filtersProp, units, onChange, singleColumn=false} = props
    const filters = {...filtersProp}

    const {
        onChangeDistanceMin, onChangeDistanceMax,
        onChangeElevationMin, onChangeElevationMax,
        onChangeCountry, onChangeContentType, onChangeRouteType, onChangeRouteSource
    } = createFilterHandlers({filters, onChange, units})

    const {distance,elevation,country='All',contentType='All',routeType='All', routeSource='All'} = filters

    const countries = withSelected(props.countries, country)
    const contentTypes = withSelected(props.contentTypes, contentType)
    const routeTypes = withSelected(props.routeTypes, routeType)
    const routeSources = withSelected(props.routeSources, routeSource)

    const distanceMin = getValue(distance?.min,1/1000)
    const distanceMax = getValue(distance?.max,1/1000)
    const elevationMin = getValue(elevation?.min)
    const elevationMax = getValue(elevation?.max)

    return <AppThemeProvider>
        <Container className='route-filter-panel' $singleColumn={singleColumn} data-columns={singleColumn ? 1 : 3}>
            <Column className='filter-column'>
                <Row>
                    <Label labelWidth='12ch'>Distance</Label>
                    <EditNumber  label='min' labelPosition='before'  labelWidth='4ch'  maxLength={5} value={distanceMin}  timeout={EDIT_TIMEOUT} allowEmpty
                        onTimeout={onChangeDistanceMin }
                        onValueChange={onChangeDistanceMin } />
                    <EditNumber  label='max' labelPosition='before'  margin='0 0 0 1ch' labelWidth='4ch'  maxLength={5} value={distanceMax}  timeout={EDIT_TIMEOUT} unit={units?.distance??'km'} allowEmpty
                        onTimeout={onChangeDistanceMax }
                        onValueChange={onChangeDistanceMax } />
                </Row>
                <Row>
                    <Label labelWidth='12ch'>Elevation</Label>
                    <EditNumber  label='min' labelPosition='before'  labelWidth='4ch'  maxLength={5} value={elevationMin}  timeout={EDIT_TIMEOUT} allowEmpty
                        onTimeout={onChangeElevationMin }
                        onValueChange={onChangeElevationMin } />
                    <EditNumber  label='max' labelPosition='before'  margin='0 0 0 1ch' labelWidth='4ch'  maxLength={5} value={elevationMax}  timeout={EDIT_TIMEOUT} unit={units?.elevation??'m'} allowEmpty
                        onTimeout={onChangeElevationMax }
                        onValueChange={onChangeElevationMax } />
                </Row>
            </Column>

            <Column className='filter-column'>
                <SegmentedControl name='filter-content-type' label='Route Content' labelWidth='12ch' fontSize='1.6vh'
                    options={contentTypes} value={contentType} onValueChange={onChangeContentType} />
                <SegmentedControl name='filter-route-type' label='Route Type' labelWidth='12ch' fontSize='1.6vh'
                    options={routeTypes} value={routeType} onValueChange={onChangeRouteType} />
            </Column>

            <Column className='filter-column'>
                <SingleSelect label='Country' labelPosition='before'  labelWidth='12ch' selected={country} options={countries}
                    onValueChange={onChangeCountry} />
                <SingleSelect label='Source' labelPosition='before'  labelWidth='12ch' selected={routeSource} options={routeSources}
                    onValueChange={onChangeRouteSource} />
            </Column>
        </Container>
    </AppThemeProvider>
}
