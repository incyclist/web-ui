import React, { useCallback, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import { getWorkoutListPageService } from "incyclist-services"
import { EventLogger } from "gd-eventlog"
import styled from "styled-components"

import { WorkoutsScreen } from "./screen"
import { getResponsiveHorizontal } from "./utils"
import { useWindowDimensions, usePageLogger } from "../../hooks"
import { usePageService } from "../../hooks/pages"
import { WorkoutDetailsDialog } from "../../components/modules/workout/selection/WorkoutDetails"
import { ScheduledWorkoutPrompt } from "../../components/modules/workout/ScheduledWorkoutPrompt"
import { Button, CheckBox, Column, Row, Overlay } from "../../components/atoms"

const PAGE_ID = 'WorkoutsList'

const List = styled.ol`
    padding: 0;
    margin: 0.5vh 0 0 0;
`

const CheckBoxRow = styled(Row)`
    bottom: 0;
`

const CreateInfoOverlay = ({ markAsSeenDefault, onClose }) => {
    const [markAsSeen, setMarkAsSeen] = useState(markAsSeenDefault ?? true)

    return <Overlay width='40vw' height='30vh' top='35vh' left='30vw'>
        <Column justify='center' position='relative'>

            <Row align='top' justify='center' height='5vh'>
                <b>These are the steps to create a workout:</b>
            </Row>
            <Row justify='center' align='center' height='18vh'>
                <Column>
                    <List type='1'>
                        <li> Click OK to open the ZwoFactory page </li>
                        <li> Within ZwoFactory, create or select a pre-defined workout</li>
                        <li> Within ZwoFactory, download the workout using the Download button </li>
                        <li> Go back to Incyclist and import the workout using the Import Card </li>
                    </List>
                </Column>
            </Row>
            <Row justify='center' height='7vh'>
                <Button text='OK' onClick={() => onClose(markAsSeen)} />
            </Row>

            <CheckBoxRow justify='left' height='3vh' position='absolute' align='bottom' bottom='0'>
                <CheckBox label='Do not show again' value={markAsSeen} onValueChange={(checked) => setMarkAsSeen(checked)} />
            </CheckBoxRow>

        </Column>
    </Overlay>
}

export const WorkoutsPage = () => {

    const service = getWorkoutListPageService()
    const props = usePageService(service)
    const location = useLocation()

    const [screenProps, setScreenProps] = useState(() => service.getScreenProps())
    const [pageState, setPageState] = useState(null)
    const refAutoOpened = useRef(null)

    const [logger, closePageLogger] = usePageLogger(PAGE_ID, pageState)

    useEffect(() => { setPageState('open') }, [])

    const updateScreenProps = useCallback((w, h) => {

        const respList = getResponsiveHorizontal(w, h, { offset: 210, padding: 0 })
        const { cardSize } = respList
        delete respList.cardSize

        const limits = Object.keys(respList)
        const aboveIdx = limits.findIndex(limit => limit > w)

        const updated = aboveIdx !== -1 ? respList[limits[aboveIdx - 1]].items : -1

        const sp = { itemsFit: updated, responsive: respList, cardSize, offset: 210, width: w, height: h }
        setScreenProps(sp)
        service.setScreenProps(sp)

        const cards = Math.floor((w - 210) / cardSize.width)
        new EventLogger('WorkoutsPage').logEvent({ message: 'carousel calculated', width: w, height: h, cardSize, cardsCnt: cards })

    }, [service])

    let { height, width } = useWindowDimensions((current) => {
        service.onResize()
        updateScreenProps(current.width, current.height)
        width = current.width
        height = current.height
    })

    useEffect(() => {
        if (screenProps)
            return
        updateScreenProps(width, height)
    }, [screenProps, updateScreenProps, width, height])

    // opened from outside (e.g. scheduled-workout prompt): open the details dialog once per distinct id
    const autoOpenDetailsId = location?.state?.autoOpenDetailsId
    useEffect(() => {
        if (!autoOpenDetailsId || refAutoOpened.current === autoOpenDetailsId)
            return
        refAutoOpened.current = autoOpenDetailsId
        service.onOpenDetails(autoOpenDetailsId)
    }, [autoOpenDetailsId, service])

    const closePage = useCallback(() => { closePageLogger() }, [closePageLogger])

    const onInitialized = useCallback((listId, e) => {
        service.onCarouselInitialized(listId, e?.item, e?.itemsInSlide)
        logger.logEvent({ message: 'Carousel initialized', list: listId, item: e?.item, itemsInSlide: e?.itemsInSlide })
    }, [service, logger])

    const onSlideChanged = useCallback((listId, e) => {
        service.onCarouselUpdated(listId, e?.item, e?.itemsInSlide)
    }, [service])

    const onOK = useCallback((id, files) => { service.onCardOK(id, files) }, [service])
    const onDelete = useCallback((id) => { service.onDelete(id) }, [service])
    const onRetry = useCallback((id) => { service.onRetry(id) }, [service])

    const { loading = true, lists = [], upcoming = null, displayType = 'tiles', detailWorkoutId, createInfo } = props ?? {}

    return <>
        <WorkoutsScreen lists={lists} upcoming={upcoming} displayType={displayType} loading={loading} {...screenProps}
            closePage={closePage}
            onOK={onOK}
            onDelete={onDelete}
            onRetry={onRetry}
            onInitialized={onInitialized}
            onSlideChanged={onSlideChanged} />

        {detailWorkoutId ? <WorkoutDetailsDialog id={detailWorkoutId} /> : null}

        <ScheduledWorkoutPrompt />

        {createInfo ? <CreateInfoOverlay markAsSeenDefault={createInfo.markAsSeenDefault}
            onClose={(markAsSeen) => service.onCreateInfoClosed(markAsSeen)} /> : null}
    </>
}
