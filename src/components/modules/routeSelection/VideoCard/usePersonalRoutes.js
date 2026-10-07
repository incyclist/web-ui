import { useEffect, useId, useState } from 'react'
import { ActivitiesRepository, useActivityList, useUserSettings } from 'incyclist-services'
import { summarizeHistory } from './insights'

const FAVORITES_KEY = 'routes.favorites'
let pendingHistory

// Share the summary load across visible cards. Never load individual ride logs for a tile.
const loadHistory = () => {
    if (pendingHistory) return pendingHistory
    const service = useActivityList()
    const ready = service.isStillLoading() ? service.preload().wait() : Promise.resolve()
    pendingHistory = ready.then(() => new ActivitiesRepository().getAll()).finally(() => { pendingHistory = undefined })
    return pendingHistory
}

export const useRouteFavorites = () => {
    const settings = useUserSettings()
    const requester = useId()
    const readFavorites = () => settings.getValue(FAVORITES_KEY, [])
    const [favorites, setFavorites] = useState(readFavorites)
    const [error, setError] = useState()

    useEffect(() => {
        const observer = settings.requestNotifyOnChange(requester, FAVORITES_KEY)
        const update = value => setFavorites(Array.isArray(value) ? value : [])
        observer.on('changed', update)
        update(readFavorites())
        return () => {
            observer.off('changed', update)
            settings.stopNotifyOnChange(requester)
        }
    }, [settings, requester])

    const toggleFavorite = id => {
        const key = id == null ? undefined : String(id)
        if (!key) return
        try {
            const current = readFavorites()
            const values = Array.isArray(current) ? current : []
            settings.set(FAVORITES_KEY, values.includes(key) ? values.filter(v => v !== key) : [...values, key])
            setError(undefined)
        } catch { setError('Could not save favorite. Try again.') }
    }
    return { favorites: Array.isArray(favorites) ? favorites : [], toggleFavorite, error }
}

export const usePersonalRoutes = ({ id, routeHash, distance, visible }) => {
    const { favorites, toggleFavorite, error } = useRouteFavorites()
    const [history, setHistory] = useState()
    const key = id == null ? undefined : String(id)
    useEffect(() => {
        let active = true
        setHistory(undefined)
        if (visible && key) {
            loadHistory().then(activities => {
                if (active) setHistory(summarizeHistory(activities, { id, routeHash, distance }))
            }).catch(() => { /* Unavailable history is not a zero ride count. */ })
        }
        return () => { active = false }
    }, [key, id, routeHash, distance, visible])

    return { isFavorite: favorites.includes(key), toggleFavorite: () => toggleFavorite(id), history, error }
}
