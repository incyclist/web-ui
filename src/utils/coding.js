
/**
 * Returns if the argument is a valid object, i.e. does not equal null or undefined.
 *
 * @param {Object}  v - argument 
 */
export function valid(v) {
    if ( v===undefined || v===null)
        return false;
    return true;
}

/**
 * Clones the content of the object ( excluding functions )
 *
 * @param   o - Object to be cloned 
 */
 export function clone (o) {
    if (!valid(o))
        return o;
    return  JSON.parse(JSON.stringify(o));
}

/**
 * returns the average of the values of an Array
 * ignores any null or undefined value that might reside in the array
 *
 * @param {Object[]}  arr - Array containing Objects 
 * @param {string}  [key] - The key of the Object value we want to build the average of. If not provided, we assume that the Array is an arry of numbers
 * 
 * @example
 *   const avg = average( [ {a:1,b:2},{a:3,b:6},{a:5,b:10}],'a')  // returns 3;
 *   const avg = average( [ 1,3,5] )  // returns 3;
 */
 export function average (arr,key)  {
    if ( !valid(arr) || !Array.isArray(arr))
        return;
    
    if ( key===undefined) {
        let cnt = 0;
        let avgData = arr.reduce( ( p, c ) =>  {
            let res = p;
            if (c!==undefined) {
                res = p + c;
                cnt++;
            }
            return res;
        }, 0 );
        
        if ( cnt>0) return avgData/ cnt;
        return undefined;
    }
    return average( arr.map( el => el ? el[key]: undefined) )
} 


/**
 * returns the sum of the values of an Array
 * ignores any null or undefined value that might reside in the array
 *
 * @param {Object[]}  arr - Array containing Objects 
 * @param {string}  [key] - The key of the Object value we want to build the sum of. If not provided, we assume that the Array is an arry of numbers
 * 
 * @example
 *   const s = sum( [ {a:1,b:2},{a:3,b:6},{a:5,b:10}],'a')  // returns 9;
 *   const s = sum( [ 1,3,5] )  // returns 9;
 */
 export function sum  (arr,key)  {
    if ( !valid(arr) || !Array.isArray(arr))
        return;

    let hasValues = false;

    const res =  arr.reduce (  (prev,current) => {
        if ( key===undefined) {
            if (!valid(current)) 
                return prev;
            hasValues = true;
            return prev+current;
        }
            
        else {
            if (!valid(current) || !valid(current[key]) )
                return prev;
            hasValues = true;
            return prev+current[key];
        } 
         
    }, 0 )      
    
    if (!hasValues)
        return;
    return res;
}


export function isObjectAndNotArray(object) {
    return (valid(object) && typeof object === 'object' && !Array.isArray(object));
}

// 'createNew' defaults to 

/**
 * overwrites the content of an object with values from a 2nd object
 *
 * @param {Object}  old - Object to be overwritten
 * @param {Object}  update - Object containing the new values
 * @param {boolean} [createNew=false] -  if set to true,the returned object will be completely new, i.e. any changes made to the result will not impact 'old' or 'update'
 * 
 * @example
 *   const u = overwrite( {a:1,b:2},{b:3})  // returns {a:1,b:3} 
 *   const u = overwrite( {a:1,b:2},{b:null})  // returns {a:1};
 *   const u = overwrite( {a:1,b:2},{b:undefined})  // returns {a:1,b:2};
 */
 export function overwrite(old, update, createNew=false) {

    if (!old) {
        old = {};
    }

    if (createNew) {
        old = clone(old);
    }

    if ( update===null)
        return undefined;
    if ( update===undefined)
        return old ;
	
    const keys = Object.keys(update)
    keys.forEach( key => {
        
        if (update[key]===null) {
            old[key] = undefined;
        }
        else if (update[key]===undefined) {
            return;
        }
        else if (isObjectAndNotArray(old[key]) && isObjectAndNotArray(update[key])) {
            overwrite(old[key], update[key], createNew);
        }
        else {
            old[key] = createNew ? clone(update[key]) : update[key];
        }  
    });
    return old;
}

export const sleep = async (ms) => new Promise( resolve => setTimeout(resolve,ms))


const Utils = {
    average,sum,
    valid,
    clone,
    overwrite
}

export default Utils