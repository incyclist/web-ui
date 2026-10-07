const finite = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))

export const validCoordinates = points => (points || []).filter(p =>
    finite(p.lat) && finite(p.lng) && Math.abs(Number(p.lat)) <= 90 && Math.abs(Number(p.lng)) <= 180)

export const profilePoints = points => (points || []).filter(p =>
    finite(p.routeDistance) && finite(p.elevation))

export const countryLabel = country => {
    if (!country) return undefined
    const code = country.toUpperCase() === 'UK' ? 'GB' : country.toUpperCase()
    try {
        return { code, name: new Intl.DisplayNames(['en'], { type: 'region' }).of(code) }
    } catch { return { code, name: country } }
}

// This is a route comparison heuristic, not a prediction of an individual's effort.
// Sample sustained ramps over >= 250 m to avoid classifying a single GPS spike as a climb.
export const routeEffort = (distance, elevation, points) => {
    if (!finite(distance) || Number(distance) <= 0 || !finite(elevation) || Number(elevation) < 0) return undefined
    const profile = profilePoints(points)
    if (profile.length < 2) return undefined
    let anchor = profile[0], steepDistance = 0
    for (const point of profile.slice(1)) {
        const length = point.routeDistance - anchor.routeDistance
        if (length < 250) continue
        const grade = (point.elevation - anchor.elevation) / length
        if (grade >= 0.06) steepDistance += length
        anchor = point
    }
    const score = Number(distance) / 1000 + Number(elevation) / 100 + steepDistance / 1000 * 2
    return {
        label: score < 25 ? 'Easy' : score < 60 ? 'Moderate' : 'Hard',
        explanation: 'Estimated route effort: distance (km) + ascent (m) / 100 + 2 × kilometres of sustained climbs at 6% or more. Easy < 25; moderate < 60; hard ≥ 60. Based on the original route; trainer settings and fitness change the actual effort.'
    }
}

export const summarizeHistory = (activities, { id, routeHash, distance }) => {
    const rides = activities.map(a => a.summary).filter(s => s && s.isSaved !== false && s.rideTime > 0 &&
        (routeHash ? s.routeHash === routeHash : id && s.routeId === id))
    // A completed custom segment is not a completed full route. Keep the ride counter
    // inclusive, but use only full, unsmoothed, 100%-reality rides for a time estimate.
    // Legacy/current summaries do not always carry isCompleted or isSaved. The
    // persisted summary, start position and travelled distance are the evidence.
    const comparable = rides.filter(s => s.isCompleted !== false && !s.segment &&
        (s.startPos ?? 0) === 0 && Number(distance) > 0 &&
        Math.abs(s.distance - distance) <= Math.max(50, Number(distance) * 0.01) &&
        (s.endPos == null || Math.abs(s.endPos - distance) <= 50) &&
        s.realityFactor === 100 && (s.smoothingLevel ?? 0) === 0 &&
        finite(s.rideTime) && s.rideTime >= 300)
    const times = comparable.map(s => s.rideTime).sort((a, b) => a - b)
    const middle = Math.floor(times.length / 2)
    const median = times.length % 2 ? times[middle] : (times[middle - 1] + times[middle]) / 2
    return {
        count: rides.length,
        estimatedMinutes: times.length >= 3 ? Math.round(median / 60) : undefined,
        sampleCount: times.length
    }
}

export const videoAvailability = ({ hasVideo, videoUrl, isDownloaded, isLocal, requiresDownload, videoPill, videoMissing }) => {
    if (!hasVideo) return undefined
    if (videoMissing) return 'Video unavailable'
    if (videoPill === 'downloading') return 'Downloading…'
    if (videoPill === 'in-icloud') return 'In iCloud'
    if (isDownloaded) return 'Downloaded'
    if (isLocal && videoUrl && !/^https?:/i.test(videoUrl)) return 'Local video'
    if (requiresDownload) return 'Download required'
    if (/^https?:/i.test(videoUrl || '')) return 'Streaming'
    return 'Check video in details'
}
