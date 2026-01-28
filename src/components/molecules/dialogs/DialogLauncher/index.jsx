import React, { useState, forwardRef, useImperativeHandle } from "react";
import { EventLogger } from "gd-eventlog";

export const DialogLauncher = forwardRef(({ onStart, onCancel }, ref) => {

    try {
        useImperativeHandle(ref, () => ({
            openDialog: openDialog,
            closeDialog: closeDialog
        }));


        const [showDialog, setShowDialog] = useState();

        const openDialog = (DialogElement, props) => {
            const childProps = props??{}

            onStart = childProps.onStart;
            onCancel = childProps.onCancel;

            const Dialog = () => <DialogElement {...childProps} onStart={onStartClicked} onCancel={onCancelClicked} onClick={e => e.stopPropagation()} />;
            setShowDialog({ Dialog });
        };

        const closeDialog = () => {
            setShowDialog(null);
        };

        const onStartClicked = async (route, settings) => {
            closeDialog();
            if (onStart)
                onStart(route, settings);
            // close
            // open next screen 
        };
        const onCancelClicked = async (route, settings) => {
            closeDialog();
            if (onCancel)
                onCancel(route, settings);
        };

        if (!showDialog)
            return null;

        return <showDialog.Dialog />;

    }
    catch(err) {
        const logger = new EventLogger('DialogLauncher')
        logger.logEvent({message:'error in component',componennt:'DialogLauncher',error:err.message, stack:err.stack})
        return null
    }

});
