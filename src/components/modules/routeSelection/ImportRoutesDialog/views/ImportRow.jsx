import React from 'react';
import styled from 'styled-components';
import { CheckBox, Column, Dynamic, Pill, Row, SkeletonBlock } from '../../../../atoms';

const ROW_HEIGHT = '4.6vh';

const RowContainer = styled(Row)`
    height: ${ROW_HEIGHT};
    width: 100%;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    opacity: ${props => (props.dimmed ? 0.5 : 1)};
`;

const CheckboxCell = styled(Column)`
    width: 3vw;
    align-items: center;
    justify-content: center;
`;

const RouteCell = styled(Column)`
    width: 32vw;
    align-items: flex-start;
    justify-content: center;
`;

const RouteLabel = styled.div`
    font-size: 1.5vh;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const FolderLabel = styled.div`
    font-size: 1.1vh;
    color: white;
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Cell = styled(Column)`
    width: ${props => props.width || '10vw'};
    align-items: flex-start;
    justify-content: center;
    font-size: 1.4vh;
    color: white;
`;

const ReasonText = styled.div`
    font-size: 1.3vh;
    color: white;
    opacity: 0.85;
`;

const formatDistance = (distance) => {
    if (!distance)
        return '';
    const { value, unit } = distance;
    return `${value}${unit}`;
};

/**
 * The data cells of one selection-table row - the part that changes when this route's own
 * `Observer` fires `'updated'` as its parse result streams in. Kept separate from
 * `ImportRow` so the `Dynamic` wrapper around it only ever re-renders this row, never the table.
 */
const ImportRowCells = ({ item, selected, onToggle }) => {
    const isParsed = item.parseState === 'parsed';
    const isDuplicate = item.duplicateOf != null;
    const isProblem = item.errorReason != null && !isDuplicate;

    return (
        <RowContainer data-testid={`import-row-${item.id}`}>
            <CheckboxCell>
                <CheckBox
                    checked={selected}
                    disabled={!item.importable}
                    onValueChange={onToggle}
                    aria-label={item.label}
                />
            </CheckboxCell>

            <RouteCell>
                <RouteLabel>{item.label}</RouteLabel>
                <FolderLabel>{item.folder}</FolderLabel>
            </RouteCell>

            <Cell width="8vw">{item.format?.toUpperCase()}</Cell>

            <Cell width="14vw" data-testid={`import-row-${item.id}-distance`}>
                {!isParsed
                    ? <SkeletonBlock width="6vw" height="1.4vh" />
                    : (item.errorReason != null ? <ReasonText>{item.errorReason}</ReasonText> : formatDistance(item.distance))}
            </Cell>

            <Cell width="10vw" data-testid={`import-row-${item.id}-status`}>
                {isProblem && <Pill text="Can't import" color="orange" textColor="black" size="small" />}
                {isDuplicate && <Pill text="Duplicate" size="small" />}
                {!isProblem && !isDuplicate && item.alreadyImported && <Pill text="Already in library" size="small" />}
            </Cell>
        </RowContainer>
    );
};

/**
 * One row of the folder-scan selection table.
 *
 * `outsideFold` is driven by the shared fold `Observer` from `useFoldWindow()`, exactly like
 * `RouteItem` in the main list - a skeleton of the same height when outside it, so scroll height
 * and overscan behave the same way for a long import list as for the route list itself.
 *
 * Inside the fold, the row's own streamed updates are wired through a *second*, row-scoped
 * `Dynamic` bound to `item.observer` (the same pattern `RouteItem` uses for its `cntActive` pill) -
 * so a parse result arriving for this route re-renders only `ImportRowCells`, never the table that
 * contains it.
 */
export const ImportRow = ({ route, outsideFold, selected, onToggle }) => {
    if (outsideFold) {
        return <RowContainer data-testid={`import-row-${route.id}`} dimmed />;
    }

    return (
        <Dynamic observer={route.observer} event="updated" prop="item" transform={value => value}>
            <ImportRowCells item={route} selected={selected} onToggle={onToggle} />
        </Dynamic>
    );
};
