import React from 'react'

export const WorkoutIcon = ({width,height,size,color='current'})=> {
    return (
        <svg
            width={width||size||50}
            height={height||size||50}
            viewBox="0 0 256 256"
        >
    
            <g className="icon_workout">
                <title>Layer 1</title>
                <rect fill={color} stroke="none" id="svg_4" x="37" y="153" width="39" height="94" />
                <rect fill={color} stroke="none" x="103.37681198120117" y="152.71014535427094" width="39" height="94"  id="svg_7"/>
                <rect fill={color} stroke="none" id="svg_8" x="76.55072498321533" y="125.33333492279053" width="26.449275016784668" height="121.66666507720947" />
                <rect fill={color} stroke="none" x="142.9275369644165" y="125.04347896575928" width="26.449275016784668" height="121.66666507720947"  id="svg_12"/>
                <path fill={color}  stroke="none"  d="M298.05590291590875,264.8612799431045 " 
                />
            </g>
        </svg>
    )

}