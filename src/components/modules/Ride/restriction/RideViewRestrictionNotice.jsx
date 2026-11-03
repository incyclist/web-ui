import React from 'react'
import { InfoText } from '../../../molecules/Ride/InfoText'

// long enough to reach the actions, unlike the text-only notices
const NOTICE_TIMEOUT = 12000

/**
 * Explains, once per ride, why the Map is shown instead of Street View/Satellite View.
 * Renders nothing unless the ride service reports a notice.
 *
 * @param {object} props.notice  `rideViewRestrictionNotice` of the ride display properties
 * @param {function} props.onAction  called with the id of the clicked action
 * @param {function} props.onClose   called when the notice was closed or timed out
 */
export const RideViewRestrictionNotice = ({ notice, onAction, onClose }) => {
    if (!notice)
        return null

    return <InfoText text={notice.text} routeDistance={notice.id} actions={notice.actions}
        onAction={onAction} onClose={onClose} timeout={NOTICE_TIMEOUT} />
}
