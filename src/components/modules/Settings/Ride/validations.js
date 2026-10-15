export function isValidGoogleMapsKeyFormat(apiKey) {
  // Matches a string exactly 39 characters long, starting with AIzaSy
  // followed by 33 URL-safe base64 characters (A-Z, a-z, 0-9, -, _)
  const googleMapsKeyRegex = /^AIzaSy[a-zA-Z0-9\-_]{33}$/;
  
  return googleMapsKeyRegex.test(apiKey);
}