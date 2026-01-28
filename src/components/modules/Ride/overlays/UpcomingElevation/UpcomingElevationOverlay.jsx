import React from "react";
import { ElevationGraph } from "../../../../molecules";

const DEFAULT_MAX_UPDATE_FREQ = 1000

export class UpcomingElevationOverlay extends React.Component {

    constructor(props) {
        super(props)
        this.maxUpdateFreq = props.maxUpdateFreq??DEFAULT_MAX_UPDATE_FREQ
        this.prevRender = 0
    }
    shouldComponentUpdate(newProps) {

        if (!this.prevRender)
            return true

        const posChanged = newProps.position?.routeDistance!==this.props.position?.routeDistance
        const routeChanged = newProps.routeData?.distance!==this.props.routeData?.distance
        const rangeChanged = newProps.range!==this.props.range

        if (rangeChanged || routeChanged)
            return true

        return (posChanged && Date.now() - this.prevRender > this.maxUpdateFreq)
    }

    render() {
        this.prevRender = Date.now()
        return <ElevationGraph {...this.props} />
    }
}