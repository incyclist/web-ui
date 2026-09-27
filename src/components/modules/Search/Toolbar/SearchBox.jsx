import React, { forwardRef, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { SearchIcon, XIcon } from "@primer/octicons-react"
import { EventLogger } from "gd-eventlog"

export const SEARCH_TIMEOUT = 500

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    height: 3.6vh;
    min-width: 20ch;
    width: ${props => props.width || '32ch'};
    max-width: 100%;
    padding: 0 0.6ch;
    border-radius: 4px;
    background: rgba(255,255,255,0.9);
    color: #333;
    box-sizing: border-box;
`

const Input = styled.input`
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 1.8vh;
    font-family: inherit;
    padding: 0 0.6ch;
    color: #333;
`

const ClearButton = styled.button`
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    color: #666;
`

/**
 * The Routes page's always-visible title search.
 *
 * Typing is debounced (500 ms) before `onChange` is called; Enter commits immediately, the
 * clear button and Esc (while it has content) clear it immediately.
 */
export const SearchBox = forwardRef( ({value, placeholder, onChange, onFocus, onBlur, width}, ref) => {

    const [text,setText] = useState(value??'')
    const refTimeout = useRef(null)
    const refCommitted = useRef(value??'')

    // an update of the value from outside (e.g. "Clear all filters") replaces the local text
    useEffect( ()=>{
        const external = value??''
        if (external!==refCommitted.current) {
            refCommitted.current = external
            setText(external)
        }
    },[value])

    useEffect( ()=>{
        return ()=>{
            if (refTimeout.current)
                clearTimeout(refTimeout.current)
        }
    },[])

    const commit = (updated) => {
        if (refTimeout.current) {
            clearTimeout(refTimeout.current)
            refTimeout.current = null
        }
        if (updated===refCommitted.current)
            return

        refCommitted.current = updated
        if (typeof onChange === 'function')
            onChange(updated.length>0 ? updated : undefined)
    }

    const onInputChange = (e) => {
        const updated = e.target.value
        setText(updated)

        if (refTimeout.current)
            clearTimeout(refTimeout.current)
        refTimeout.current = setTimeout( ()=>{
            refTimeout.current = null
            commit(updated)
        }, SEARCH_TIMEOUT)
    }

    const clear = () => {
        const logger = new EventLogger('Incyclist')
        logger.logEvent({message:'search cleared', eventSource:'user'})
        setText('')
        commit('')
    }

    const onKeyDown = (e) => {
        if (e.key==='Enter') {
            commit(text)
        }
        else if (e.key==='Escape' && text.length>0) {
            e.stopPropagation()
            clear()
        }
    }

    return (
        <Container className='search-box' width={width}>
            <SearchIcon size={16} />
            <Input ref={ref} type='text' value={text} placeholder={placeholder}
                onChange={onInputChange} onKeyDown={onKeyDown}
                onFocus={onFocus} onBlur={onBlur} />
            {text.length>0 ?
                <ClearButton type='button' className='search-clear' onClick={clear}><XIcon size={16}/></ClearButton>
                : null}
        </Container>
    )
})
