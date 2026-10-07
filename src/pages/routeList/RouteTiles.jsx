import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Dynamic, View } from '../../components/atoms'
import { VideoCard } from '../../components/modules/routeSelection/VideoCard'
import { useFoldWindow } from '../../hooks'
import { useRouteList } from 'incyclist-services'
import { AppThemeProvider } from '../../theme'
import { scrollbar } from '../../utils/scrollbar'

const TILE_WIDTH = 280
const TILE_HEIGHT = 520

const Container = styled(View)`
    box-sizing: border-box;
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
    gap: 1.5vh 1vw;
    padding: 1.5vh 0;
    overflow-x: hidden;
    ${scrollbar}
`

const Tile = styled.div`
    position: relative;
    width: ${TILE_WIDTH}px;
    height: ${TILE_HEIGHT}px;
    flex: none;
    z-index: 0;
    &:hover, &:focus-within { z-index: 1; }
`

const cardKey = (card, index) => card?.id ?? card?.getId?.() ?? `route-${index}`

/** Tiles used only by the combined routeList page. The legacy search grid keeps its sizing. */
export const RouteTiles = ({ cards, onSelect, onDelete }) => {
    const service = useRouteList()
    const onScrollTop = useCallback(top => service.setListTop('tiles', top), [service])
    const { ref, observer, isOutsideFold, getFoldEvent, swipedRecently } = useFoldWindow({
        items: cards,
        getKey: cardKey,
        initialScrollTop: service.getListTop('tiles'),
        onScrollTop
    })

    const select = id => {
        if (!swipedRecently()) onSelect?.(id)
    }

    return <AppThemeProvider>
        <Container width='100%' height='100%' ref={ref}>
            {(cards ?? []).map((card, index) => {
                const id = cardKey(card, index)
                const props = card.getDisplayProperties() ?? {}
                return <Dynamic observer={observer} key={id} event={getFoldEvent(id)} prop='outsideFold'>
                    <Tile className='route-tile'>
                        <VideoCard {...props} id={id} width={TILE_WIDTH} height={TILE_HEIGHT}
                            outsideFold={isOutsideFold(id)} onOK={() => select(id)}
                            onDelete={event => { event?.stopPropagation?.(); onDelete?.(id) }} />
                    </Tile>
                </Dynamic>
            })}
        </Container>
    </AppThemeProvider>
}
