import React from 'react'

// same glyph as the mobile app's `import-route` icon: arrow pointing down into a tray
export const ImportIcon = ({width,height,size='1.25em',color='currentColor'})=> {
    return (
        <svg
            width={width||size}
            height={height||size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            >
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M3 19h18" />
        </svg>
    )
}
