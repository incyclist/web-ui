import React,{ useCallback } from 'react'
import { Dynamic, TableContainer } from '../../../atoms'
import { AppThemeProvider } from '../../../../theme'
import { RouteItem } from '../RouteItem'
import { useFoldWindow } from '../../../../hooks'
import { useRouteList } from 'incyclist-services'

const getRouteKey = (route,idx) => route?.id??`route-${idx}`

export const RoutesTable = ({routes,onSelect,onDelete}) => {

    const service = useRouteList()

    const onScrollTop = useCallback( (top)=>{
        service.setListTop('list',top)
    },[service])

    const visible = routes??[]

    const {ref, observer, isOutsideFold, getFoldEvent, swipedRecently} = useFoldWindow({
        items: visible,
        getKey: getRouteKey,
        initialScrollTop: service.getListTop('list'),
        onScrollTop
    })

    const onItemSelected = (id) => {
        if (swipedRecently())
            return;

        if (onSelect)
            onSelect(id)
    }

    const onItemDeleted = (id) => {
        if (typeof (onDelete)==='function')
            onDelete(id)
    }

    return (
        <AppThemeProvider>
            <TableContainer className='routes' width='100%' height='100%' ref={ref} >
                {visible.map( (route,idx) => {
                    const key = getRouteKey(route,idx)
                    return (
                        <Dynamic observer={observer} key={key} event={getFoldEvent(key)} prop='outsideFold' >
                            <RouteItem outsideFold={isOutsideFold(key)}  {...route}
                                onClick={()=>{onItemSelected(route.id)}}
                                onDelete={()=>{onItemDeleted(route.id)}}
                                />
                        </Dynamic>
                    )
                })}

            </TableContainer>
        </AppThemeProvider>
    )
}
