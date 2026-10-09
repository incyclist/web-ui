import React, { useCallback, useEffect } from "react";
import { Card } from "../../routeSelection/base/Card";
import { RouteTileSummary } from "../RouteTileSummary";
import { useFoldWindow } from "../../../../hooks";
import { useRouteList } from "incyclist-services";
import { RouteTilesView, TILE_WIDTH, TILE_HEIGHT } from './component'

const cardKey = (card, index) =>
  card?.id ?? card?.getId?.() ?? `route-${index}`;

// Service cards start as invisible. Activate each one as it enters the fold;
// Card keeps its sized skeleton in place until the service sends its update.
const VisibleRouteTile = ({ card, outsideFold, ...props }) => {
  useEffect(() => {
    if (!outsideFold) {
      if (!card.isVisible?.()) card.setVisible?.(true);
      card.setInitialized?.(true);
    }
  }, [card, outsideFold]);

  return <Card {...props} card={card} outsideFold={outsideFold} />;
};

/** Tiles used only by the combined routeList page. The legacy search grid keeps its sizing. */
export const RouteTiles = ({ cards, onSelect, onDelete }) => {
  const service = useRouteList();
  const onScrollTop = useCallback(
    (top) => service.setListTop("tiles", top),
    [service],
  );
  const { ref, observer, initialized, isOutsideFold, getFoldEvent, swipedRecently } =
    useFoldWindow({
      items: cards,
      getKey: cardKey,
      initialScrollTop: service.getListTop("tiles"),
      onScrollTop,
    });

  const select = (id) => {
    if (!swipedRecently()) onSelect?.(id);
  };

  const tiles = (cards ?? []).map((card, index) => {
    const id = cardKey(card, index)
    return { id, props: {
      ...card.getDisplayProperties(), card, id,
      width: TILE_WIDTH, height: TILE_HEIGHT, Summary: RouteTileSummary,
      onOK: () => select(id),
      onDelete: event => { event?.stopPropagation?.(); onDelete?.(id) }
    }}
  })

  return <RouteTilesView tiles={tiles} containerRef={ref} observer={observer}
    initialized={initialized} isOutsideFold={isOutsideFold} getFoldEvent={getFoldEvent}
    TileComponent={VisibleRouteTile} />
};

export { RouteTilesView } from './component'
