import { describe, test, expect } from 'vitest'
import {
    getHeaderLayout, getFilterChips, countActiveFilters, hasActiveFilters, removeFilter, clearPanelFilters,
    formatCount, getRouteCountText, getNoMatchHint, SORT_OPTIONS
} from './utils'

describe('getHeaderLayout', () => {

    test('title and actions share one row at 1000px and above', () => {
        expect(getHeaderLayout(1000)).toEqual({actionsOnOwnRow:false, singleColumnFilters:false})
        expect(getHeaderLayout(1640)).toEqual({actionsOnOwnRow:false, singleColumnFilters:false})
    })

    test('actions drop to their own row between 700px and 1000px', () => {
        expect(getHeaderLayout(999)).toEqual({actionsOnOwnRow:true, singleColumnFilters:false})
        expect(getHeaderLayout(700)).toEqual({actionsOnOwnRow:true, singleColumnFilters:false})
    })

    test('below 700px the filter panel also collapses to one column', () => {
        expect(getHeaderLayout(699)).toEqual({actionsOnOwnRow:true, singleColumnFilters:true})
        expect(getHeaderLayout(120)).toEqual({actionsOnOwnRow:true, singleColumnFilters:true})
    })

    test('an unknown width is treated as wide', () => {
        expect(getHeaderLayout(undefined)).toEqual({actionsOnOwnRow:false, singleColumnFilters:false})
        expect(getHeaderLayout(0)).toEqual({actionsOnOwnRow:false, singleColumnFilters:false})
        expect(getHeaderLayout(NaN)).toEqual({actionsOnOwnRow:false, singleColumnFilters:false})
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
