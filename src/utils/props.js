export const copyPropsExcluding = ( base,reserved=[] ) => {
    const props = {...base};
    const keys = Object.keys(props);
    keys.forEach( key => { 
        if (reserved.find( el=> el===key)) delete props[key]
    });        
    return props;
}

export const mergeProps = ( child,parent,reserved=[]) => {      
    const props = child ? {...child} : {}
    let keys;

    if ( child) {
        keys = Object.keys(child);
        keys.forEach( key => { 
            if (reserved.find( el=> el===key)) delete props[key]
        });        
    }

    if (parent) {
        keys = Object.keys(parent);
        keys.forEach( key => { 
            if (reserved.find( el=> el===key)) return;
            if (props[key]!==undefined) return;
            props[key] = parent[key];
        });        

    }    
    return props;    
}
