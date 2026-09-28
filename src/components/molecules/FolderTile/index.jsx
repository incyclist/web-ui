import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import { useAppUI } from '../../../bindings/native-ui';

const Tile = styled.div`
    box-sizing: border-box;
    width: ${props => props.$width};
    height: ${props => props.$height};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1vh;
    padding: 2vh;
    text-align: center;
    border: 2px dashed ${props => props.$disabled ? '#eeeeee' : '#dcdcdc'};
    border-radius: 10px;
    color: ${props => props.$disabled ? '#bdbdbd' : undefined};
    opacity: ${props => props.$disabled ? 0.5 : 1};
    cursor: ${props => props.$disabled ? 'default' : 'pointer'};
    outline: none;
    transition: border .24s ease-in-out;

    &:hover, &:focus-visible {
        border-color: ${props => props.$disabled ? '#eeeeee' : 'white'};
    }
`;

const size = (value) => typeof value === 'number' ? `${value}px` : value;

/**
 * A click-to-select tile for a folder - the counterpart of the Dropzone molecule for directories
 * (a folder cannot be dropped as a file can, it is picked with the native folder dialog).
 *
 * Logs the same user events as the Dropzone (`dropzone clicked`, and the selection).
 *
 * @param {string} [id]
 * @param {React.ReactNode} [text] what the tile shows
 * @param {(folder: {uri: string, displayName: string}) => void} onSelect called with the chosen folder; not called when the user cancels
 * @param {boolean} [disabled]
 * @param {number|string} [width='100%']
 * @param {number|string} [height='100%']
 */
export const FolderTile = ({ id, text, children, onSelect, disabled = false, width = '100%', height = '100%', className }) => {
    const ui = useAppUI();
    const selecting = useRef(false);

    const select = useCallback(async () => {
        if (disabled || selecting.current)
            return;
        selecting.current = true;

        const logger = new EventLogger('Incyclist');
        logger.logEvent({ message: 'dropzone clicked', dropZone: id, directory: true, eventSource: 'user' });

        try {
            const result = await ui?.selectDirectory();
            if (!result || result.canceled) {
                logger.logEvent({ message: 'button clicked', button: 'cancel', source: 'user' });
                return;
            }
            logger.logEvent({ message: 'dropzone folder selected', dropZone: id, folder: result.displayName, source: 'user' });
            if (onSelect)
                onSelect({ uri: result.selected, displayName: result.displayName });
        }
        catch (err) {
            logger.logEvent({ message: 'error', fn: 'FolderTile.select', error: err?.message, stack: err?.stack });
        }
        finally {
            selecting.current = false;
        }
    }, [ui, disabled, id, onSelect]);

    const onKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            select();
        }
    };

    return (
        <Tile
            id={id}
            className={className}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            $width={size(width)}
            $height={size(height)}
            $disabled={disabled}
            onClick={select}
            onKeyDown={onKeyDown}
        >
            {text}
            {children}
        </Tile>
    );
};
