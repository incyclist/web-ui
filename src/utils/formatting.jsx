import {valid} from './coding'

export function dateFormat (date, fstr='%Y%m%d%H%M%S', utc=false) {
    if ( !valid(date) || !(date instanceof Date))
        return;
    utc = utc ? 'getUTC' : 'get';
    
    return fstr.replace (/%[YmdHMS]/g, (m) => {
        switch (m) {
            case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
            case '%m': m = 1 + date[utc + 'Month'] (); break;
            case '%d': m = date[utc + 'Date'] (); break;
            case '%H': m = date[utc + 'Hours'] (); break;
            case '%M': m = date[utc + 'Minutes'] (); break;
            case '%S': m = date[utc + 'Seconds'] (); break;

            /* istanbul ignore next */            
            default: return m.slice (1); // this code can never be reached, but lint would complain about missing 'default'
        }
        // add leading zero if required
        return ('0' + m).slice (-2);
    });
}

export function pad (num,size=2) {
    const abs = Math.abs(num);
    const sgn = abs===0 ? 0: num/abs;
    
    const fixed = abs.toFixed(0);

    let s = '';
    if (sgn<0) s+='-'

    // TODO
	for (let i=0; i<size-fixed.length;i++ ) {s+= '0'}
    s+=abs;
	return s;
};

export function trimTrailingChars(s, charToTrim) {
    let c = charToTrim;
    if ( charToTrim===undefined) {
        c = s.charAt(s.length-1)
    }
    var regExp = new RegExp(c + "+$");
    var result = s.replace(regExp, "");
  
    return result;
}

export function timeFormat( tv, cutMissing=false ) {
    if ( !valid(tv))
        return;

    let timeVal = Math.round(tv);

    var h = parseInt(timeVal/3600);
    timeVal = timeVal % 3600;
    var m = parseInt(timeVal/60);
    timeVal = timeVal % 60;
    var s = parseInt(timeVal);

    if (cutMissing===false || h>0)
        return  h + ':'+ pad(m) +':' +pad(s);
    else 
        return pad(m) +':' +pad(s);
} 


const Formatting =  {
    dateFormat,
    timeFormat,
    pad,
    trimTrailingChars
}

export default Formatting