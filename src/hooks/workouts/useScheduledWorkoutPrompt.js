import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { getScheduledWorkoutPromptPageService } from 'incyclist-services'
import { EventLogger } from 'gd-eventlog'

const DIALOG_CLOSED = 'incyclist-dialog-closed'

/**
 * Holds the "workout scheduled today" prompt for a host page.
 *
 * The prompt service decides whether a prompt is due (incl. the once-per-session guard). This hook
 * only asks it when no other dialog is open. If one is open, it waits until a dialog was closed
 * and does not call `show()` meanwhile, so the guard is not consumed.
 *
 * @param {boolean} enabled  defaults to true
 * @returns {{prompt: {title:string}|null, onYes:Function, onNo:Function, onCheckWorkouts:Function}}
 */
export const useScheduledWorkoutPrompt = (enabled = true) => {
    const [promptProps, setPromptProps] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!enabled) return

        const service = getScheduledWorkoutPromptPageService()
        const logger = new EventLogger('ScheduledWorkoutPrompt')
        let waiting = false

        const onDialogClosed = () => {
            window.removeEventListener(DIALOG_CLOSED, onDialogClosed)
            waiting = false
            checkAndShow()
        }

        const checkAndShow = () => {
            if (window.activeDialog) {
                if (!waiting) {
                    waiting = true
                    logger.logEvent({ message: 'scheduled workout prompt deferred' })
                    window.addEventListener(DIALOG_CLOSED, onDialogClosed)
                }
                return
            }

            const props = service.show()
            if (props) setPromptProps(props)
        }

        checkAndShow()
        service.on('scheduled', checkAndShow)

        return () => {
            service.off('scheduled', checkAndShow)
            window.removeEventListener(DIALOG_CLOSED, onDialogClosed)
        }
    }, [enabled])

    const onYes = useCallback(() => {
        if (!promptProps) return
        const nav = getScheduledWorkoutPromptPageService().onYes(promptProps)
        setPromptProps(null)
        navigate('/' + nav.page, nav.autoOpenDetailsId ? { state: { autoOpenDetailsId: nav.autoOpenDetailsId } } : undefined)
    }, [promptProps, navigate])

    const onNo = useCallback(() => {
        if (promptProps) getScheduledWorkoutPromptPageService().onNo(promptProps)
        setPromptProps(null)
    }, [promptProps])

    const onCheckWorkouts = useCallback(() => {
        const nav = promptProps ? getScheduledWorkoutPromptPageService().onCheckWorkouts(promptProps) : { page: 'workouts' }
        setPromptProps(null)
        navigate('/' + nav.page)
    }, [promptProps, navigate])

    const prompt = useMemo(() => (promptProps ? { title: promptProps.title } : null), [promptProps])

    return { prompt, onYes, onNo, onCheckWorkouts }
}
