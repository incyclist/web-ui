// User-facing texts of the Route Sharing tab, the connect window and the firewall notice.

export const NAME_MAX_LENGTH = 40
export const CODE_VALID_SECONDS = 120

export const PANEL_TITLE = 'Route Sharing'
export const PANEL_DESCRIPTION = 'Let your phone or tablet ride the videos stored on this computer.'
export const REASSURANCE = 'Also works with videos on a NAS or an external drive. Nothing is uploaded; both only need to be on the same Wi‑Fi.'

export const FIREWALL_LINE = {
    windows: 'After you click Connect, Windows may ask about Incyclist: keep "Private networks" ticked and click "Allow".',
    macos: 'After you click Connect, your Mac may ask about incoming connections: click "Allow".'
}

export const NAME_LABEL = 'Name of this computer'
export const NAME_WARNING = 'Don\'t use your own name. Guests and people on public Wi‑Fi can see it too.'
export const NAME_CHANGED_NOTE = 'Connected phones and tablets show the new name the next time they connect, unless it was renamed on the phone.'
export const CHANGE_LABEL = 'Change'
export const nameLine = (name, connected) =>
    `Everyone on the same network ${connected ? 'sees' : 'will see'} this computer as "${name}".`

export const CONNECT_BUTTON = 'Connect your phone or tablet'
export const CONNECT_ANOTHER_BUTTON = 'Connect another phone or tablet'

export const SWITCH_LABEL = 'Share routes with my phones and tablets'
export const SWITCH_NOTE_ON = 'Runs whenever Incyclist is open, also on other networks such as a hotel\'s Wi‑Fi. Only the phones and tablets below can play your routes.'
export const SWITCH_NOTE_OFF = 'Your phones and tablets show this computer as not reachable.'
export const STATUS_OFF = 'Not sharing'
export const STATUS_NO_ROUTES = 'No video routes yet'
export const statusOn = (routeCount) => routeCount > 0
    ? `Sharing ${routeCount} ${routeCount === 1 ? 'route' : 'routes'}`
    : STATUS_NO_ROUTES

export const DEVICES_TITLE = 'Connected phones and tablets'
export const REMOVE_LABEL = 'Remove'
export const removeTitle = (device) => `Remove ${device}?`
export const removeText = (device, isLast) =>
    `${device} will no longer be able to play routes from this computer. To use it again, connect it again.${isLast ? ' This computer stops sharing until you connect a phone or tablet again.' : ''}`

export const START_ERROR = 'Route Sharing couldn\'t start. Close Incyclist, open it again, and try once more.'
export const TRY_AGAIN = 'Try Again'

export const HELP_TITLE = 'Phone or tablet can\'t find this computer?'
export const helpItems = (platform) => {
    const items = []
    if (platform === 'windows')
        items.push('Windows must treat this network as Private: Windows Settings › Network & internet › Wi‑Fi (or Ethernet) › your network › Network profile type › Private. On a Public network, Windows blocks your phone without telling you.')
    items.push('Both must be on the same Wi‑Fi or home network — not a guest network, not mobile data.')
    items.push('Incyclist must stay open on this computer. It shares only while the app is open.')
    if (platform === 'windows')
        items.push('If you clicked "Cancel" when Windows asked: Windows Security › Firewall & network protection › Allow an app through firewall › Change settings › tick "Private" next to Incyclist.')
    if (platform === 'macos')
        items.push('If the macOS firewall is on: System Settings › Network › Firewall › Options… › set Incyclist to "Allow incoming connections".')
    if (platform === 'linux')
        items.push('If you use a firewall (for example ufw or firewalld), allow incoming connections for Incyclist.')
    return items
}

export const CONNECT_TITLE = 'Connect your phone or tablet'
export const STARTING = 'Getting ready…'
export const STARTING_HINT = {
    windows: 'If Windows asks about Incyclist, keep "Private networks" ticked and click "Allow".',
    macos: 'If your Mac asks whether Incyclist may accept incoming connections, click "Allow".'
}
export const WAITING_STEPS = (name) => [
    'On your phone or tablet, open Incyclist.',
    'Go to Settings › Routes › Route Sharing › Add Computer.',
    `Choose "${name}".`
]
export const suffixLine = (name, suffix) => `If "${name}" is listed more than once, choose "${name} (${suffix})".`
export const WAITING = 'Waiting for your phone or tablet…'
export const KEEP_OPEN = 'Keep this window open until your phone or tablet says it\'s connected.'

export const wantsToConnect = (device) => `${device} wants to connect`
export const typeThisCode = (device) => `Type this code on ${device}:`
export const expiresIn = (m, ss) => `Code expires in ${m}:${ss}`
export const wrongTry = (device, n) => `Wrong code typed on ${device} — ${n} ${n === 1 ? 'try' : 'tries'} left.`
export const REPLACED = (device) => `A new request from ${device} replaced the previous one.`

export const connectedTitle = (device) => `${device} is connected`
export const CONNECTED_TEXT = 'Your routes will show up on it in a moment.'

export const NOTICES = {
    denied: (device) => `You turned down the request from ${device}.`,
    expired: (device) => `The code for ${device} has expired. If you still want to connect it, tap "Get a new code" on ${device}.`,
    invalidated: (device) => `The code was typed wrongly three times. To try again, tap "Get a new code" on ${device}.`,
    abandoned: (device) => `${device} stopped connecting.`
}

export const CONNECT_ERROR = 'Couldn\'t get ready to connect. Close this window and try again. If it keeps happening, restart Incyclist.'

export const FIREWALL_UPDATE_TITLE = 'Windows may ask about Incyclist'
export const FIREWALL_UPDATE_TEXT = 'Incyclist was updated. Windows may ask again whether Incyclist may use the network. Keep "Private networks" ticked and click "Allow" so your phones and tablets can keep playing routes from this computer.'
