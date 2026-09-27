/**
 * Bounds and de-duplicates the fallback `service.getRouteDetails(id)` calls that `RouteItem` and
 * `VideoCard` make for a route whose decimated preview shape has not been backfilled yet.
 *
 * Without this, every row/tile that enters the fold fires its own `getRouteDetails()` call with
 * no cap - a fast scroll (or the initial mount of a large library) can put dozens of them in
 * flight at once. It also happens that `VideoCard` mounts its `Summary` and `Details` side at the
 * same time for the same route id (`Card.jsx` renders both, just CSS-rotated out of view), so
 * without de-duplication a single visible tile already fires two independent requests for the
 * same route.
 *
 * A request for an id that already has a queued or in-flight job shares that job - only one
 * `getRouteDetails()` call is made, and every caller's callback is invoked with its result.
 *
 * `request()` returns a cancel function. Call it when the caller loses interest (the row left the
 * fold, or the component unmounted) - if the job has not started yet and no other caller is still
 * interested, it is removed from the queue and never consumes a concurrency slot. A job that has
 * already started cannot be aborted (the underlying call has no cancellation), so it runs to
 * completion; if nobody is listening any more its result is simply discarded.
 */

/**
 * Max number of concurrent `getRouteDetails()` calls across all rows/tiles.
 *
 * Chosen small on purpose: this bounds main-thread/IPC work during a fast scroll or the first
 * pass over a pre-existing library (before shapes are backfilled), not steady-state throughput -
 * the fold window itself is already only ~15-30 rows. Low enough that a burst of fold-entries
 * cannot stampede `getRouteDetails()`, high enough that the queue still drains within a scroll
 * gesture rather than visibly trailing it.
 */
export const ROUTE_DETAILS_CONCURRENCY = 4

export class RouteDetailsQueue {

    constructor(maxConcurrent = ROUTE_DETAILS_CONCURRENCY) {
        this.maxConcurrent = maxConcurrent
        this.active = 0
        this.pending = []       // jobs waiting for a concurrency slot, in request order
        this.jobs = new Map()   // id -> job, whether queued or in flight
    }

    /**
     * Requests a route's details, sharing an existing queued/in-flight job for the same id.
     *
     * @param service   object exposing `getRouteDetails(id)` (typically `useRouteList()`)
     * @param id        route id
     * @param onResult  called with the resolved details (or `undefined` on failure), unless the
     *                  caller has cancelled by then
     * @returns a cancel function
     */
    request(service, id, onResult) {
        if (!id || typeof service?.getRouteDetails !== 'function' || typeof onResult !== 'function')
            return () => {}

        let job = this.jobs.get(id)
        if (!job) {
            job = { id, listeners: new Set(), started: false }
            this.jobs.set(id, job)
            this.pending.push(job)
        }
        job.listeners.add(onResult)

        this.drain(service)

        return () => {
            job.listeners.delete(onResult)
            if (!job.started && job.listeners.size===0) {
                const idx = this.pending.indexOf(job)
                if (idx>=0)
                    this.pending.splice(idx,1)
                if (this.jobs.get(id)===job)
                    this.jobs.delete(id)
            }
        }
    }

    drain(service) {
        while (this.active<this.maxConcurrent && this.pending.length>0) {
            const job = this.pending.shift()

            // cancelled while queued - nobody left to deliver to, skip without consuming a slot
            if (job.listeners.size===0) {
                if (this.jobs.get(job.id)===job)
                    this.jobs.delete(job.id)
                continue
            }

            job.started = true
            this.active++

            service.getRouteDetails(job.id)
                .then( details => {
                    job.listeners.forEach( cb => {
                        try { cb(details) }
                        catch { /* a listener's own handling is its own responsibility */ }
                    })
                })
                .catch( ()=> { /* consumers render without map/elevation on failure */ })
                .finally( ()=> {
                    this.active--
                    if (this.jobs.get(job.id)===job)
                        this.jobs.delete(job.id)
                    this.drain(service)
                })
        }
    }

    /** Test-only: drops all bookkeeping. Does not (cannot) cancel promises already in flight. */
    reset() {
        this.active = 0
        this.pending = []
        this.jobs.clear()
    }
}

/** Shared across every `RouteItem`/`VideoCard` instance in the app. */
export const routeDetailsQueue = new RouteDetailsQueue()
