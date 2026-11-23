// User-facing texts of the Route Sharing tab, the connect window and the firewall notice.

export const NAME_MAX_LENGTH = 40
export const CODE_VALID_SECONDS = 120

export const PANEL_TITLE = 'Route Sharing'
export const PANEL_DESCRIPTION = 'Let your phone or tablet ride the videos stored on this computer.'
export const INTRO = 'Ride the video routes on this computer from the Incyclist app on your phone or tablet — including routes stored on a NAS or an external drive. Nothing is uploaded anywhere; both devices only need to be on the same network.'

export const FIREWALL_NOTE_TITLE = 'Before you click'
export const FIREWALL_NOTE = {
    windows: 'Windows may show "Windows Defender Firewall has blocked some features of this app". Keep "Private networks" ticked and click "Allow" (on some versions "Allow access"). Without this, your phone or tablet can\'t find this computer.',
    macos: 'If the macOS firewall is on, your Mac asks whether "Incyclist" may accept incoming network connections. Click "Allow". Without this, your phone or tablet can\'t find this computer.'
}

export const NAME_LABEL = 'Name of this computer'
export const NAME_WARNING = 'Everyone on the same network can see this name — including guests, and other people on public Wi‑Fi. Don\'t use your own name.'
export const NAME_CHANGED_NOTE = 'Connected phones and tablets show the new name the next time they connect — unless it was renamed on the phone.'

export const CONNECT_BUTTON = 'Connect your phone or tablet'
export const CONNECT_ANOTHER_BUTTON = 'Connect another phone or tablet'

export const SWITCH_LABEL = 'Share routes with my phones and tablets'
export const ANY_NETWORK_NOTE = 'While this is on, Route Sharing runs whenever Incyclist is open, also on other networks such as a hotel\'s Wi‑Fi. Others on that network can see this computer\'s name; only the phones and tablets listed below can play your routes.'
export const STATUS_OFF = 'Off • your phones and tablets show this computer as not reachable until you switch it back on.'
export const STATUS_ON_EMPTY = 'On • no routes to share yet — routes with a video you add to Incyclist appear on your phones automatically.'

export const statusOn = (routeCount) => routeCount > 0
    ? `On • sharing ${routeCount} ${routeCount === 1 ? 'route' : 'routes'}`
    : STATUS_ON_EMPTY

export const DEVICES_TITLE = 'Connected phones and tablets'
export const REMOVE_LABEL = 'Remove'
export const removeTitle = (device) => `Remove ${device}?`
export const removeText = (device, isLast) =>
    `${device} will no longer be able to play routes from this computer. To use it again, connect it again.${isLast ? ' This computer stops sharing until you connect a phone or tablet again.' : ''}`

export const START_ERROR = 'Route Sharing couldn\'t start on this computer. Close Incyclist, open it again, and try once more.'
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
    'Go to Settings › Route Sharing › Add Computer.',
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
export const connectedText = (device) => `Its routes appear on ${device} in a moment.`

export const NOTICES = {
    denied: (device) => `You turned down the request from ${device}.`,
    expired: (device) => `The code for ${device} has expired. If you still want to connect it, tap "Get a new code" on ${device}.`,
    invalidated: (device) => `The code was typed wrongly three times. To try again, tap "Get a new code" on ${device}.`,
    abandoned: (device) => `${device} stopped connecting.`
}

export const CONNECT_ERROR = 'Couldn\'t get ready to connect. Close this window and try again. If it keeps happening, restart Incyclist.'

export const FIREWALL_UPDATE_TITLE = 'Windows may ask about Incyclist'
export const FIREWALL_UPDATE_TEXT = 'Incyclist was updated. Windows may ask again whether Incyclist may use the network. Keep "Private networks" ticked and click "Allow" so your phones and tablets can keep playing routes from this computer.'
