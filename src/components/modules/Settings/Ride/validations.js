export function isValidGoogleMapsKeyFormat(apiKey) {
  // Matches a string exactly 39 characters long, starting with AIzaSy
  // followed by 33 URL-safe base64 characters (A-Z, a-z, 0-9, -, _)
  const googleMapsKeyRegex = /^AIzaSy[a-zA-Z0-9\-_]{33}$/;
  
  return googleMapsKeyRegex.test(apiKey);
}

/**
 * Hides all but the first and last characters of a Maps API key, so that it does not leak
 * through a screenshot (e.g. in a support request). Short values are returned as they are.
 */
export function maskGoogleMapsKey(apiKey) {
  const KEEP_START = 7
  const KEEP_END = 2

  if (typeof apiKey !== 'string' || apiKey.length <= KEEP_START + KEEP_END)
    return apiKey

  return apiKey.slice(0, KEEP_START) + '·'.repeat(apiKey.length - KEEP_START - KEEP_END) + apiKey.slice(-KEEP_END)
}
