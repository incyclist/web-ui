/**
 * Pure helpers of the Routes page: header layout, filter chips, result count and sort options.
 * Kept free of React so that they can be unit tested on their own.
 */

// horizontal padding of the page's content area (left + right)
export const CONTENT_PADDING = 80

// content width below which the filter panel collapses to one column
export const FILTER_COLUMNS_MIN_WIDTH = 700

export const SORT_OPTIONS = [
    { value:'suggested', label:'Suggested' },
    { value:'name',      label:'Name (A–Z)' },
    { value:'distance',  label:'Distance' },
    { value:'elevation', label:'Elevation' },
]

export const FREE_RIDE_TOOLTIP = 'Pick any spot on the map and ride the real roads from there'

/**
 * Determines how the filter panel degrades on narrow windows. The page header's title and
 * actions rows are fixed (title alone, centered; actions left-aligned below it, at every
 * width) - see ux.md §3.1/§3.10 for why that stopped being a function of content width.
 *
 * An unknown width (not measured yet) is treated as wide.
 *
 * @param {number} contentWidth width of the content area, excluding its padding
 * @returns {{singleColumnFilters:boolean}}
 */
export const getHeaderLayout = (contentWidth) => {
    if (!contentWidth || contentWidth<0 || Number.isNaN(contentWidth))
        return { singleColumnFilters:false }

    return {
        singleColumnFilters: contentWidth<FILTER_COLUMNS_MIN_WIDTH
    }
}

const isSet = (v) => v!==undefined && v!==null && v!==''

const formatBound = (v, scope) => {
    if (typeof v === 'number') {
        return scope==='distance' ? `${v/1000} km` : `${v} m`
    }
    if (v?.value!==undefined && v?.unit) {
        return `${v.value} ${v.unit}`
    }
    return undefined
}

const getRangeLabel = (range, name, scope) => {
    if (!range)
        return undefined

    const min = isSet(range.min) ? formatBound(range.min,scope) : undefined
    const max = isSet(range.max) ? formatBound(range.max,scope) : undefined
    const parts = []
    if (min) parts.push(`min ${min}`)
    if (max) parts.push(`max ${max}`)

    return parts.length ? `${name} ${parts.join(', ')}` : undefined
}

/**
 * Returns one chip per active filter of the filter panel (the title search is not a chip -
 * it is always visible in the search box).
 *
 * @returns {Array<{key:string,label:string}>}
 */
export const getFilterChips = (filters) => {
    if (!filters)
        return []

    const chips = []
    const add = (key,label) => { if (label) chips.push({key,label}) }

    add('distance',    getRangeLabel(filters.distance,'Distance','distance'))
    add('elevation',   getRangeLabel(filters.elevation,'Elevation','elevation'))
    add('contentType', isSet(filters.contentType) ? filters.contentType : undefined)
    add('routeType',   isSet(filters.routeType) ? filters.routeType : undefined)
    add('country',     isSet(filters.country) ? filters.country : undefined)
    add('routeSource', isSet(filters.routeSource) ? filters.routeSource : undefined)

    return chips
}

/** number of active filters behind the "Filters" disclosure */
export const countActiveFilters = (filters) => getFilterChips(filters).length

/** true if any filter - including the title search - narrows the list */
export const hasActiveFilters = (filters) => isSet(filters?.title) || countActiveFilters(filters)>0

/** removes one filter (as identified by its chip key) */
export const removeFilter = (filters, key) => {
    const updated = {...(filters??{})}
    delete updated[key]
    return updated
}

/** removes all filters of the filter panel, keeping the title search */
export const clearPanelFilters = (filters) => {
    const updated = {}
    if (isSet(filters?.title))
        updated.title = filters.title
    if (filters?.includeDeleted)
        updated.includeDeleted = filters.includeDeleted
    return updated
}

/** formats a count with a (non-breaking) space as thousands separator, e.g. 1 247 */
export const formatCount = (n) => {
    const value = Math.max(0, Math.round(Number(n)||0))
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/**
 * Result count shown in the toolbar: `1 247 routes` or, when filtered, `38 of 1 247 routes`.
 */
export const getRouteCountText = (shown, total, filtered) => {
    const noun = (n) => n===1 ? 'route' : 'routes'
    if (!filtered)
        return `${formatCount(shown)} ${noun(shown)}`
    return `${formatCount(shown)} of ${formatCount(total)} ${noun(total)}`
}

/**
 * Second line of the "No routes match" state: names the cheapest filter change that would
 * produce results - the title search on its own.
 *
 * @param {number} titleOnlyCount number of routes matching the title search alone
 * @param {string} title the title search
 * @returns {string|undefined} undefined if there is nothing useful to suggest
 */
export const getNoMatchHint = (titleOnlyCount, title) => {
    if (!isSet(title) || !titleOnlyCount)
        return undefined
    const matches = titleOnlyCount===1 ? 'route matches' : 'routes match'
    return `Try removing a filter — ${formatCount(titleOnlyCount)} ${matches} “${title}” on its own.`
}
