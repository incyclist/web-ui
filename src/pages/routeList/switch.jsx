import React from "react"
import { useAppState } from "incyclist-services"
import { RouteListPage } from "./page"
import { RoutesPage } from "../routes"
import { SearchPage } from "../search"

const useNewRoutePage = () => {
    try {
        return useAppState().hasFeature('NEW_SEARCH_UI')===true
    }
    catch {
        return false
    }
}

/**
 * `/routes`: the merged Routes page while NEW_SEARCH_UI is enabled, the classic carousel otherwise.
 */
export const RoutesPageEntry = () => {
    return useNewRoutePage() ? <RouteListPage/> : <RoutesPage/>
}

/**
 * `/search`: a permanent alias of the merged Routes page while NEW_SEARCH_UI is enabled (a persisted
 * last page of 'search' must keep resolving), the classic Search page otherwise.
 */
export const SearchPageEntry = () => {
    return useNewRoutePage() ? <RouteListPage/> : <SearchPage/>
}
