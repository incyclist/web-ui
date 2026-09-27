/**
 * Pure helpers of the Routes page: header layout, filter chips, result count and sort options.
 * Kept free of React so that they can be unit tested on their own.
 */

// horizontal padding of the page's content area (left + right)
export const CONTENT_PADDING = 80

// content width below which the filter panel collapses to one column
export const FILTER_COLUMNS_MIN_WIDTH = 700

// allowance added to the measured actions+title width before comparing it against the content
// width - keeps the header from flipping to the stacked layout right at the pixel where the two
// groups' rendered boxes would otherwise touch
export const HEADER_LAYOUT_GAP = 24

export const SORT_OPTIONS = [
    { value:'suggested', label:'Suggested' },
    { value:'name',      label:'Name (A–Z)' },
    { value:'distance',  label:'Distance' },
    { value:'elevation', label:'Elevation' },
]

export const FREE_RIDE_TOOLTIP = 'Pick any spot on the map and ride the real roads from there'

// copy deck for the page-level drop overlay shown while a file is dragged over the page
export const DROP_OVERLAY_TITLE = 'Drop to import'

/**
 * Second line of the page-level drop overlay: `<n> files · .gpx, .epm and .xml are supported`.
 * Falls back to the plain support sentence when the browser hasn't told us a count yet.
 */
export const getDropOverlayHint = (fileCount) => {
    const n = Math.round(Number(fileCount)||0)
    if (!(n>0))
        return '.gpx, .epm and .xml are supported'
    const noun = n===1 ? 'file' : 'files'
    return `${n} ${noun} · .gpx, .epm and .xml are supported`
}

/**
 * Determines how the header and the filter panel degrade on narrow windows.
 *
 * The header normally renders as one row (Free Ride/Import Routes, the page title, an empty
 * spacer) laid out as three equal-ish grid columns so the title sits at the true horizontal
 * center of the row. That only works while the actions group and the title both fit next to each
 * other - once their combined rendered width would exceed the available content width, the header
 * falls back to a stacked layout (title alone on its own row, actions left-aligned below it).
 *
 * This is deliberately based on the actual rendered widths rather than a fixed pixel breakpoint:
 * the header's contents are all sized in viewport-relative units, so a fixed px threshold flips
 * the layout inconsistently at different window heights.
 *
 * An unknown/unmeasured width (0, negative, NaN or undefined) is treated as wide, so the page
 * renders its normal single-row layout before the first real measurement lands.
 *
 * @param {number} actionsWidth rendered width of the Free Ride/Import Routes actions group
 * @param {number} titleWidth rendered width of the page title
 * @param {number} contentWidth width of the content area, excluding its padding
 * @returns {{stackHeader:boolean, singleColumnFilters:boolean}}
 */
export const getHeaderLayout = (actionsWidth, titleWidth, contentWidth) => {
    if (!contentWidth || contentWidth<0 || Number.isNaN(contentWidth))
        return { stackHeader:false, singleColumnFilters:false }

    const actions = Number(actionsWidth)||0
    const title = Number(titleWidth)||0

    return {
        stackHeader: (actions+title+HEADER_LAYOUT_GAP)>contentWidth,
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
