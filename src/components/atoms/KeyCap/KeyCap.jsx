import React from 'react';
import styled from 'styled-components';

const Cap = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: calc(var(--u, 10px) * 2);
    height: calc(var(--u, 10px) * 2);
    padding: 0 calc(var(--u, 10px) * 0.4);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-bottom-width: calc(var(--u, 10px) * 0.2);
    border-radius: calc(var(--u, 10px) * 0.4);
    background: rgba(255, 255, 255, 0.12);
    color: #f7f5fa;
    font-size: max(12px, calc(var(--u, 10px) * 1.2));
    font-weight: 700;
    line-height: 1;
    user-select: none;
`;

/**
 * A key glyph (e.g. the number key that selects an option). Sized by the `--u` scale unit of the parent, if defined
 */
export const KeyCap = ({ children, className, style }) => (
    <Cap className={className} style={style} aria-hidden="true">{children}</Cap>
);
