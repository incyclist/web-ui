import { describe, test, expect } from 'vitest'
import {
    getHeaderLayout, getFilterChips, countActiveFilters, hasActiveFilters, removeFilter, clearPanelFilters,
    formatCount, getRouteCountText, getNoMatchHint, getDropOverlayHint, SORT_OPTIONS
} from './utils'

describe('getHeaderLayout', () => {

    // actions/title widths chosen so their sum (plus the internal gap) never gets close to the
    // FILTER_COLUMNS_MIN_WIDTH boundary - these two thresholds are unrelated and must not interact
    const FITS = [300, 200]

    test('the filter panel stays multi-column at 700px and above', () => {
        expect(getHeaderLayout(...FITS, 700)).toEqual({stackHeader:false, singleColumnFilters:false})
        expect(getHeaderLayout(...FITS, 1640)).toEqual({stackHeader:false, singleColumnFilters:false})
    })

    test('below 700px the filter panel collapses to one column', () => {
        expect(getHeaderLayout(...FITS, 699)).toEqual({stackHeader:false, singleColumnFilters:true})
        expect(getHeaderLayout(...FITS, 720)).toEqual({stackHeader:false, singleColumnFilters:false})
    })

    test('an unknown content width is treated as wide, header unstacked', () => {
        expect(getHeaderLayout(...FITS, undefined)).toEqual({stackHeader:false, singleColumnFilters:false})
        expect(getHeaderLayout(...FITS, 0)).toEqual({stackHeader:false, singleColumnFilters:false})
        expect(getHeaderLayout(...FITS, NaN)).toEqual({stackHeader:false, singleColumnFilters:false})
    })

    test('actions and title fit next to each other: single-row (grid) header', () => {
        // 300 + 200 + gap(24) = 524, well under 900
        expect(getHeaderLayout(300, 200, 900)).toEqual({stackHeader:false, singleColumnFilters:false})
    })

    test('actions and title together overflow the content width: stacked header', () => {
        // 500 + 400 + gap(24) = 924, over 800
        expect(getHeaderLayout(500, 400, 800)).toEqual({stackHeader:true, singleColumnFilters:false})
    })

    test('right at the boundary: fitting exactly does not stack, one pixel over does', () => {
        // 500 + 400 + gap(24) = 924
        expect(getHeaderLayout(500, 400, 924)).toEqual({stackHeader:false, singleColumnFilters:false})
        expect(getHeaderLayout(500, 400, 923)).toEqual({stackHeader:true, singleColumnFilters:false})
    })

    test('unmeasured (falsy) actions/title widths never force a stack on their own', () => {
        expect(getHeaderLayout(0, 0, 300)).toEqual({stackHeader:false, singleColumnFilters:true})
        expect(getHeaderLayout(undefined, undefined, 300)).toEqual({stackHeader:false, singleColumnFilters:true})
    })
})

describe('filter chips', () => {

    test('no filters - no chips', () => {
        expect(getFilterChips(undefined)).toEqual([])
        expect(getFilterChips({})).toEqual([])
        expect(countActiveFilters({})).toBe(0)
    })

    test('the title search is not a chip', () => {
        expect(getFilterChips({title:'Alpe'})).toEqual([])
        expect(hasActiveFilters({title:'Alpe'})).toBe(true)
    })

    test('one chip per active panel filter', () => {
        const chips = getFilterChips({title:'Alpe', contentType:'Video', country:'France', routeType:'Loop', routeSource:'Local'})
        expect(chips).toEqual([
            {key:'contentType', label:'Video'},
            {key:'routeType', label:'Loop'},
            {key:'country', label:'France'},
            {key:'routeSource', label:'Local'},
        ])
        expect(countActiveFilters({contentType:'Video', country:'France'})).toBe(2)
    })

    test('distance and elevation ranges are one chip each, with units', () => {
        const chips = getFilterChips({
            distance:{min:{value:40,unit:'km'}, max:undefined},
            elevation:{min:{value:100,unit:'m'}, max:{value:500,unit:'m'}}
        })
        expect(chips).toEqual([
            {key:'distance', label:'Distance min 40 km'},
            {key:'elevation', label:'Elevation min 100 m, max 500 m'},
        ])
    })

    test('plain numbers are interpreted as meters', () => {
        expect(getFilterChips({distance:{max:80000}})).toEqual([{key:'distance', label:'Distance max 80 km'}])
        expect(getFilterChips({elevation:{min:250}})).toEqual([{key:'elevation', label:'Elevation min 250 m'}])
    })

    test('an emptied range is not a chip', () => {
        expect(getFilterChips({distance:{min:undefined,max:undefined}, elevation:{min:null}})).toEqual([])
        expect(hasActiveFilters({distance:{min:undefined}})).toBe(false)
    })

    test('removeFilter drops one filter, clearPanelFilters keeps only the title search', () => {
        const filters = {title:'Alpe', contentType:'Video', country:'France'}
        expect(removeFilter(filters,'country')).toEqual({title:'Alpe', contentType:'Video'})
        expect(clearPanelFilters(filters)).toEqual({title:'Alpe'})
        expect(clearPanelFilters({country:'France'})).toEqual({})
        expect(filters).toEqual({title:'Alpe', contentType:'Video', country:'France'})
    })
})

describe('route count', () => {

    test('formats thousands with a space', () => {
        expect(formatCount(1247)).toBe('1 247')
        expect(formatCount(38)).toBe('38')
        expect(formatCount(1234567)).toBe('1 234 567')
        expect(formatCount(undefined)).toBe('0')
    })

    test('unfiltered: "<m> routes"', () => {
        expect(getRouteCountText(1247,1247,false)).toBe('1 247 routes')
    })

    test('filtered: "<n> of <m> routes"', () => {
        expect(getRouteCountText(38,1247,true)).toBe('38 of 1 247 routes')
        expect(getRouteCountText(0,1247,true)).toBe('0 of 1 247 routes')
    })
})

describe('no match hint', () => {

    test('names how many routes match the title search on its own', () => {
        expect(getNoMatchHint(3,'Ventoux')).toBe('Try removing a filter — 3 routes match “Ventoux” on its own.')
    })

    test('nothing to suggest without a title search or without matches', () => {
        expect(getNoMatchHint(3,undefined)).toBeUndefined()
        expect(getNoMatchHint(0,'Ventoux')).toBeUndefined()
    })
})

test('sort options, Suggested first', () => {
    expect(SORT_OPTIONS.map(o=>o.label)).toEqual(['Suggested','Name (A–Z)','Distance','Elevation'])
    expect(SORT_OPTIONS.map(o=>o.value)).toEqual(['suggested','name','distance','elevation'])
})

describe('drop overlay hint', () => {

    test('singular and plural file counts', () => {
        expect(getDropOverlayHint(1)).toBe('1 file · .gpx, .epm and .xml are supported')
        expect(getDropOverlayHint(2)).toBe('2 files · .gpx, .epm and .xml are supported')
    })

    test('falls back to the plain support sentence when no count is known yet', () => {
        expect(getDropOverlayHint(0)).toBe('.gpx, .epm and .xml are supported')
        expect(getDropOverlayHint(undefined)).toBe('.gpx, .epm and .xml are supported')
    })
})
