// The one sentence per import failure, keyed by the service's stable RouteImportErrorCode.
// Every place that reports a failed route import - the dialog's result screen, its summary of
// failed routes, and the row pinned for a dropped file - renders it through here, so the same
// failure reads the same wherever the file came in.

export const UNREADABLE_FILE_TEXT = "This file couldn't be read";

const IMPORT_ERROR_TEXT = {
    AVI_NOT_SUPPORTED: 'Its video is an AVI file — Incyclist needs MP4',
    NO_VIDEO: 'No video file found for this route',
};

/**
 * The sentence shown for a failed route import.
 *
 * @param {{code?: string, missingExt?: string}} [failure] - a RouteImportError, a
 *  RouteImportFailure or a FailedRoute: anything carrying the service's error `code`
 * @returns {string} the copy for that failure - "This file couldn't be read" for any failure
 *  without a more specific sentence (including an unknown or missing code)
 */
export const getImportErrorText = (failure) => {
    const code = failure?.code;
    if (code === 'MISSING_COMPANION')
        return `A file this route needs (.${failure.missingExt ?? 'epp'}) is not in its folder`;

    return IMPORT_ERROR_TEXT[code] ?? UNREADABLE_FILE_TEXT;
};
