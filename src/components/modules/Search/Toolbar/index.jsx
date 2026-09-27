import React, { forwardRef } from "react"
import styled from "styled-components"
import { ChevronDownIcon, ChevronUpIcon, FilterIcon, XIcon } from "@primer/octicons-react"
import { EventLogger } from "gd-eventlog"
import { SearchBox } from "./SearchBox"

export { SearchBox, SEARCH_TIMEOUT } from "./SearchBox"

const Container = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.8vh 1ch;
    width: 100%;
    padding: 0.5vh 0 1vh 0;
    color: white;
    font-size: 1.8vh;
`

const Chips = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5vh 0.6ch;
`

const Spacer = styled.div`
    flex: 1;
`

const ToolbarButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.6ch;
    height: 3.6vh;
    padding: 0 1ch;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 4px;
    background: ${props => props.$active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'};
    color: white;
    font-size: 1.8vh;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
        background: ${props => props.theme?.button?.hover?.background || '#8dc100'};
    }
`

const Badge = styled.span`
    display: inline-block;
    min-width: 1.2em;
    padding: 0 0.5ch;
    border-radius: 16px;
    background: #dd9933;
    color: white;
    font-size: 1.5vh;
    text-align: center;
`

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4ch;
    border-radius: 16px;
    padding: 0.3vh 0.6ch 0.3vh 1.2ch;
    background: #dd9933;
    color: white;
    font-size: 1.5vh;
    white-space: nowrap;
`

const ChipRemove = styled.button`
    display: inline-flex;
    align-items: center;
    border: none;
    background: none;
    padding: 0;
    color: white;
    cursor: pointer;
`

const LinkButton = styled.button`
    border: none;
    background: none;
    padding: 0;
    color: white;
    text-decoration: underline;
    font-size: 1.5vh;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
`

const Count = styled.span`
    white-space: nowrap;
    opacity: 0.9;
`

const SortLabel = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 0.6ch;
    white-space: nowrap;
`

const Select = styled.select`
    font-size: 1.6vh;
    font-family: inherit;
    height: 3.2vh;
`

const log = (message, props) => {
    const logger = new EventLogger('Incyclist')
    logger.logEvent({message, ...props, eventSource:'user'})
}

/**
 * Toolbar of the Routes page:
 *
 * `[search box] [Filters (n)] (chip x) (chip x) Clear all   <count>   Sort: [...]`
 *
 * The chips summarise the active filters and stay visible while the filter panel is collapsed.
 */
export const RouteListToolbar = forwardRef( ({
        title, chips=[], filtersExpanded=false, countText,
        sortOrder, sortOptions=[],
        onTitleChange, onToggleFilters, onRemoveFilter, onClearFilters, onSortOrderChange,
        onSearchFocus, onSearchBlur
    }, searchRef) => {

    const onToggle = () => {
        log('button clicked', {button:'Filters', expanded:!filtersExpanded})
        if (typeof onToggleFilters === 'function')
            onToggleFilters()
    }

    const onRemove = (chip) => {
        log('filter removed', {filter:chip.key})
        if (typeof onRemoveFilter === 'function')
            onRemoveFilter(chip.key)
    }

    const onClear = () => {
        log('button clicked', {button:'Clear all'})
        if (typeof onClearFilters === 'function')
            onClearFilters()
    }

    const onSortChanged = (e) => {
        const value = e.target.value
        log('option selected', {field:'Sort', value})
        if (typeof onSortOrderChange === 'function')
            onSortOrderChange(value)
    }

    const cnt = chips.length

    return (
        <Container className='route-list-toolbar'>
            <SearchBox ref={searchRef} value={title} placeholder='Search routes by name'
                onChange={onTitleChange} onFocus={onSearchFocus} onBlur={onSearchBlur} />

            <ToolbarButton type='button' className='filters-toggle' aria-expanded={filtersExpanded} $active={filtersExpanded} onClick={onToggle}>
                <FilterIcon size={14}/>
                Filters
                {cnt>0 ? <Badge className='filters-count'>{cnt}</Badge> : null}
                {filtersExpanded ? <ChevronUpIcon size={14}/> : <ChevronDownIcon size={14}/>}
            </ToolbarButton>

            {cnt>0 ?
                <Chips className='filter-chips'>
                    {chips.map( chip => (
                        <Chip key={chip.key} className='filter-chip' data-filter={chip.key}>
                            {chip.label}
                            <ChipRemove type='button' className='filter-chip-remove' onClick={()=>onRemove(chip)}><XIcon size={12}/></ChipRemove>
                        </Chip>
                    ))}
                    <LinkButton type='button' className='filters-clear' onClick={onClear}>Clear all</LinkButton>
                </Chips>
                : null}

            <Spacer/>

            {countText ? <Count className='route-count'>{countText}</Count> : null}

            <SortLabel>
                Sort:
                <Select className='sort-order' value={sortOrder} onChange={onSortChanged}>
                    {sortOptions.map( o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
            </SortLabel>
        </Container>
    )
})
