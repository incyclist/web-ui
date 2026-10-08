import React from "react"
import { RouteListPage } from "./page"

/**
 * `/routes`: the merged Routes page.
 */
export const RoutesPageEntry = () => {
    return <RouteListPage/>
}

/**
 * `/search`: a permanent alias of the merged Routes page (a persisted last page of 'search' must
 * keep resolving).
 */
export const SearchPageEntry = () => {
    return <RouteListPage/>
}
