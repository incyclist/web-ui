import { EventLogger } from "gd-eventlog";

/**
 * Creates the change handlers of the route search filter fields.
 *
 * Every handler builds the updated filter object and calls `onChange` with it - but only if the
 * value of that field actually changed. Shared by the classic `SearchFilter` block and the
 * collapsible filter panel of the Routes page, so that both produce identical filter objects.
 *
 * @param {object} props
 * @param {object} props.filters   the currently active filters
 * @param {(filters)=>void} props.onChange  called with the complete, updated filter object
 * @param {object} [props.units]   the user's units ({distance, elevation}), if known
 */
export const createFilterHandlers = ({filters: filtersProp, onChange, units}) => {

    const filters = {...filtersProp}

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

    return {
        onChangeTitle,
        onChangeDistanceMin, onChangeDistanceMax,
        onChangeElevationMin, onChangeElevationMax,
        onChangeCountry, onChangeContentType, onChangeRouteType, onChangeRouteSource
    }
}

/**
 * Returns the value to be shown in a distance/elevation edit field for a filter bound
 * (either a plain number, scaled by `factor`, or a `{value,unit}` object).
 */
export const getFilterFieldValue = (v,factor=1)=> {
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
