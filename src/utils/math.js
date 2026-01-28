/** convert numeric (signed) degrees to radians */
export const rad = ( num ) => {
    return num * Math.PI / 180;
}

/* calculates the sinus from a value specified in degrees 
    Note: Math.sin() calculates the sinus of a value specified in radians
*/
export const sin = (degree) => {
    return Math.sin( rad(degree) )
}

/* calculates the cosinus from a value specified in degrees 
    Note: Math.cos() calculates the cosinus of a value specified in radians
*/
export const cos = (degree) =>{
    return Math.cos( rad(degree) )
}
