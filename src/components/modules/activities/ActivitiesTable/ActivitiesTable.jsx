import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useActivityList } from 'incyclist-services'
import { Dynamic, TableContainer } from '../../../atoms'
import { AppThemeProvider } from '../../../../theme'
import { useFoldWindow } from '../../../../hooks'
import { ActivityListItem } from '../../../molecules/Activity'

const List = styled(TableContainer)`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 10px;
    min-height: 0;
    overflow-y: auto;
`

const getActivityKey = (activity, index) => activity.summary?.id ?? `activity-${index}`

export const ActivitiesTable = ({ activities, onSelect, onDelete }) => {
    const service = useActivityList()
    const onScrollTop = useCallback(top => service.setListTop(top), [service])
    const visible = activities ?? []
    const { ref, observer, isOutsideFold, getFoldEvent, swipedRecently } = useFoldWindow({
        items: visible,
        getKey: getActivityKey,
        initialScrollTop: service.getListTop(),
        onScrollTop
    })

    return <AppThemeProvider>
        <List className='activities' width='100%' height='100%' ref={ref}>
            {visible.map((activity, index) => {
                const key = getActivityKey(activity, index)
                return <Dynamic observer={observer} key={key} event={getFoldEvent(key)} prop='outsideFold'>
                    <ActivityListItem activityInfo={activity} outsideFold={isOutsideFold(key)}
                        onClick={onSelect ? () => { if (!swipedRecently()) onSelect(activity.summary?.id) } : undefined}
                        onDelete={onDelete ? () => onDelete(activity.summary?.id) : undefined} />
                </Dynamic>
            })}
        </List>
    </AppThemeProvider>
}
