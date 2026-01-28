export const api = window?.electron 

export const isElectron = ()=> {
    return !!api
}


export const legacyApi = window?.localSupport

export const isLegacyElectron = ()=> {
    const legacy = window?.localSupport
    return !!legacy
}

export function hasFeature(feature) {
    return api?.hasFeature(feature)??false 
}


