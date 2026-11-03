import React, { useState } from 'react'
import { useRideDisplay } from 'incyclist-services'
import { ErrorBoundary } from '../../../atoms'
import { RideViewRestrictionDialogView } from './RideViewRestrictionDialogView'

/**
 * Dialog that explains why Street View and Satellite View are not available in a simulated ride.
 *
 * @param {function} props.onClose    close the dialog
 * @param {function} props.onAddKey   the rider wants to add their own Maps API key
 * @param {function} props.onDiscard  the rider confirmed to discard the ride and connect a device
 */
export const RideViewRestrictionDialog = ({ onClose, onAddKey, onDiscard }) => {
    const ride = useRideDisplay()
    const [content, setContent] = useState(() => ride.getRideViewRestrictionDialogProps())

    const onReminderChanged = (enabled) => {
        ride.setRideViewReminder(enabled)
        setContent(ride.getRideViewRestrictionDialogProps())
    }

    return <ErrorBoundary hideOnError>
        <RideViewRestrictionDialogView {...content}
            onClose={onClose} onAddKey={onAddKey} onDiscard={onDiscard} onReminderChanged={onReminderChanged} />
    </ErrorBoundary>
}
