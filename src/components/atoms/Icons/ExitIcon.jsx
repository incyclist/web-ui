import React from 'react'

export const ExitIcon = ({width,height,size,color='current'})=> {
    return (
        <svg
            width={width||size||50}
            height={height||size||50}
            viewBox="0 0 15 15"
        >
      
        <path
            fill={color}
            fillRule="evenodd"
            d="M3 1a1 1 0 00-1 1v11a1 1 0 001 1h7.5a.5.5 0 000-1H3V2h7.5a.5.5 0 000-1H3zm9.604 3.896a.5.5 0 00-.708.708L13.293 7H6.5a.5.5 0 000 1h6.793l-1.397 1.396a.5.5 0 00.708.708l2.25-2.25a.5.5 0 000-.708l-2.25-2.25z"
            clipRule="evenodd"
        />
        </svg>
    )
 
}