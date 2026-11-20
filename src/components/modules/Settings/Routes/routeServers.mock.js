const builtIn = { key: 'Incyclist', name: 'Incyclist', isBuiltIn: true, status: 'ok', statusText: 'Built in', canRemove: false }

export const serversWithStatuses = [
    builtIn,
    { key: 'Alpine Videos', name: 'Alpine Videos', host: 'alpine-videos.example.org', isBuiltIn: false, status: 'ok', routeCount: 24, statusText: '24 routes', canRemove: true },
    { key: 'Flanders', name: 'Flanders', host: 'flanders.example.org', isBuiltIn: false, status: 'loading', statusText: 'Checking…', canRemove: true },
    { key: 'Old Server', name: 'Old Server', host: 'old.example.org', isBuiltIn: false, status: 'unreachable', statusText: "Couldn't be reached last time. Routes you already have still work.", canRemove: true },
    { key: 'Nas', name: 'Nas', host: 'nas:8080', isBuiltIn: false, status: 'ok', routeCount: 3, statusText: '3 routes', isLocal: true, isUnencrypted: true, tag: 'Local · not encrypted', canRemove: true },
    { key: 'Home', name: 'Home', host: 'home.local', isBuiltIn: false, status: 'empty', statusText: 'No routes yet', isLocal: true, tag: 'Local', canRemove: true },
    { key: 'Config', name: 'Config', host: 'plain.example.org', isBuiltIn: false, status: 'ok', routeCount: 5, statusText: '5 routes', addedOutsideApp: true, note: 'Added outside the app', canRemove: true },
]

export const known = [
    { id: 'alpine', name: 'Alpine Videos', description: 'Alps & Dolomites, 40+ climbs', operator: 'Alpine Video Club', state: 'available' },
    { id: 'flanders', name: 'Flanders Classics', description: 'Cobbles and bergs', operator: 'VZW Kassei', state: 'added', routeCount: 24, statusText: 'Added ✓ · 24 routes' },
]

export const manualIdle = { url: '', name: '', nameTouched: false, state: 'idle', canSubmit: false, canCheck: false }

const trustNote = "Routes come from the server's operator, not from Incyclist. Only add servers you trust."
const knownNote = 'Listed servers were checked to work with Incyclist. Their content comes from their operators.'

const base = {
    view: 'list', origin: 'settings', servers: serversWithStatuses, isEmpty: false, known: [], manual: manualIdle, trustNote,
}

export const listProps = base

export const emptyProps = {
    ...base, servers: [builtIn], isEmpty: true,
    emptyState: {
        title: 'Get more routes from other providers',
        text: 'Some riders and groups host their own routes, mostly videos. Add their route server and its routes appear in your route list automatically.',
    },
}

export const addWithKnownProps = { ...base, view: 'add', known, knownNote }
export const addWithoutKnownProps = { ...base, view: 'add', known: [] }

const typed = { url: 'videos.alpine-club.org', name: 'Alpine Club', nameTouched: false, suggestedName: 'Alpine Club', canSubmit: true, canCheck: true }

export const manual = {
    typed: { ...manualIdle, ...typed, state: 'idle' },
    localHttp: { ...manualIdle, ...typed, url: 'http://nas:8080', name: 'Nas', state: 'idle', localNote: "Local server — traffic isn't encrypted. Use this only on your home network." },
    checking: { ...manualIdle, ...typed, state: 'checking', canSubmit: false },
    success: { ...manualIdle, ...typed, state: 'success', message: 'Found 24 routes.', canSubmit: false },
    checked: { ...manualIdle, ...typed, url: 'nas:8080', resolvedUrl: 'http://nas:8080', name: 'Nas', state: 'checked', message: 'Found 24 routes.', localNote: "Local server — traffic isn't encrypted." },
    confirmEmpty: { ...manualIdle, ...typed, state: 'confirm-empty', message: 'This server works but has no routes yet. Add it anyway?' },
    urlError: { ...manualIdle, ...typed, state: 'error', urlError: "Plain http:// only works for servers on your home network. For servers on the internet, use an https:// address." },
    nameError: { ...manualIdle, ...typed, name: 'Incyclist', nameTouched: true, state: 'error', nameError: 'This name is reserved. Please choose another one.', canSubmit: false },
}

export const knownStates = [
    { id: 'a', name: 'Available', description: 'Not added yet', operator: 'Someone', state: 'available' },
    { id: 'b', name: 'Checking', description: 'Being checked', state: 'checking', statusText: 'Checking…' },
    { id: 'c', name: 'Added', description: 'Already in your list', state: 'added', routeCount: 12, statusText: 'Added ✓ · 12 routes' },
    { id: 'e', name: 'Added empty', description: 'No routes yet', state: 'added', statusText: 'Added ✓' },
    { id: 'd', name: 'Failed', description: 'Could not be reached', state: 'error', error: "This server couldn't be reached. Check the address and your connection." },
]

export const removeWithRoutes = {
    key: 'Alpine Videos', name: 'Alpine Videos', routeCount: 24, removeRoutes: false,
    title: 'Remove "Alpine Videos"?', text: 'You have 24 routes from this server in your route list.',
    keepLabel: 'Keep these routes', removeRoutesLabel: 'Remove these routes too, including 3 downloaded videos (1.2 GB).', confirmLabel: 'Remove server',
}

export const removeWithoutRoutes = {
    key: 'Flanders', name: 'Flanders', routeCount: 0, removeRoutes: false, title: 'Remove "Flanders"?', confirmLabel: 'Remove',
}
