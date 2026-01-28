import { Workout } from "incyclist-services";

export function getStepPower(step,ftp) {
    let stepText;
    if ( step.power===undefined)
        return '';

    const unit = step.power.type==='watt' ? 'W' : '%'
    if ( step.steady || step.cooldown===false) {
        if ( step.power.min!==undefined && step.power.max!==undefined && step.power.min<step.power.max) 
            stepText = `${step.steady?'':'Ramp '}${Math.round(step.power.min)}-${Math.round(step.power.max)}${unit}` 
        else if ( step.power.max!==undefined) 
            stepText = `${Math.round(step.power.max)}${unit}` 
        else 
            stepText = ''

        if ( stepText!=='' && ftp!==undefined && unit==='%') {
            if ( step.power.min!==undefined && step.power.max!==undefined && step.power.min<step.power.max) 
                stepText += ` (${Math.round(step.power.min/100*ftp)}-${Math.round(step.power.max/100*ftp)}W)` 
            else  
                stepText += ` (${Math.round(step.power.max/100*ftp)}W)` 

        }
        if ( stepText!=='' && ftp!==undefined && unit==='W') {
            if ( step.power.min!==undefined && step.power.max!==undefined && step.power.min<step.power.max) 
                stepText += ` (${Math.round(step.power.min*100/ftp)}-${Math.round(step.power.max*100/ftp)}%)` 
            else  
                stepText += ` (${Math.round(step.power.max*100/ftp)}%)` 

        }

    }
    else {
        if ( step.power.min!==undefined && step.power.max!==undefined && step.power.min<step.power.max) 
            stepText = `Ramp ${Math.round(step.power.max)}-${Math.round(step.power.min)}${unit}` 
        else if ( step.power.max!==undefined) 
            stepText = `${Math.round(step.power.max)}${unit}` 
        else 
            stepText = ''

        if ( stepText!=='' && ftp!==undefined && unit==='%') {
            if ( step.power.min!==undefined && step.power.max!==undefined && step.power.min<step.power.max) 
                stepText += ` (${Math.round(step.power.max/100*ftp)}-${Math.round(step.power.min/100*ftp)}W)` 
            else  
                stepText += ` (${Math.round(step.power.max/100*ftp)}W)` 

        }
        if ( stepText!=='' && ftp!==undefined && unit==='W') {
            if ( step.power.min!==undefined && step.power.max!==undefined && step.power.min<step.power.max) 
                stepText += ` (${Math.round(step.power.max*100/ftp)}-${Math.round(step.power.min*100/ftp)}%)` 
            else  
                stepText += ` (${Math.round(step.power.max*100/ftp)}%)` 

        }
    
    }
    return stepText;
}

export function getStepDuration(step) {
    if ( step.duration<=60 ) {
        return `${step.duration}s`
    }
    if ( step.duration<=3600 ) {
        return `${step.duration/60}min`
    }
    return `${step.duration/3600}h`
}


export function getMinPower(step, ftp) {
    if (step === undefined || step.power === undefined) {
        return undefined;
    }
    const p = step.power;
    if (p.max !== undefined && p.min !== undefined && p.max === p.min)
        return 0;

    if (p.min === undefined)
        return undefined;

    let res = Math.round(p.min);
    if (p.type === 'watt' && ftp !== undefined)
        res = Math.round(p.min / ftp * 100);
    return res;
}

export function getMaxPower(step, ftp) {
    if (step === undefined || step.power === undefined) {
        return 0;
    }

    const p = step.power;
    if (p.max === undefined)
        return undefined;

    let res = Math.round(p.max);
    if (p.type === 'watt' && ftp !== undefined)
        res = Math.round(p.max / ftp * 100);
    return res;
}

export function getZone(power, ftp) {
    if (power === undefined)
        return;
    if (ftp === undefined)
        return 0;
    if (power <= 55)
        return 1;
    if (power <= 75)
        return 2;
    if (power <= 90)
        return 3;
    if (power <= 105)
        return 4;
    if (power <= 120)
        return 5;
    if (power <= 150)
        return 6;
    return 7;
}

export function getLocs(evt) {
    const xLoc = evt.pageX;
    const yLoc = evt.pageY;
    return { xLoc, yLoc };
}

export const getDataSeries = ( props) => {

    let {ftp,start,stop,workout,absValues=false} = props??{};

    let ds = [];
    if (!(workout instanceof Workout)) {
        try {
            workout = new Workout(workout)
        }
        catch {}
    }
    if ( workout===undefined || !(workout instanceof Workout))
        return [];

    const push = props=> {
        let ignore = false;
        if ( start!==undefined) {
            if ( props.x<start )
                ignore = true;
            if ( props.x>start && props.x0<start) {
                props.x0 = start;
            }
        }
        if ( stop!==undefined) {
            if ( props.x0>stop) {
                ignore = true;
            }
            if ( props.x>stop && props.x0<stop) {
                props.x = stop;
            }
        }
        if ( !ignore)
            ds.push(props);
    }

    let done = false;
    let step;
    let stepStart = 0;
    while (!done) {
        let limits
        if ( step===undefined) {
            limits = workout.getLimits(0,true)
        }
        else {
            stepStart+=step.getDuration();
            limits = workout.getLimits( stepStart+0.01,true)
        }
        done = (limits===undefined);

        if ( !done) {
            step = limits.step;

            if (step.steady) {
                let x0 = stepStart;
                let x = stepStart+step.getDuration()
                let y = getMaxPower(step,ftp);
                let y0 = getMinPower(step,ftp);
                let zone = getZone(y,ftp);

                if (absValues && ftp) {
                    y = ftp*y/100
                    y0 = ftp*y0/100
                }
                
                
                if ( y!==undefined && !isNaN(y) && y0!==undefined && !isNaN(y0)) {
                    push({x,x0,y,y0,zone,step})
                    if (y0!==0)
                        push({x,x0,y:y0,y0:0,zone,step,opacity:0.8})

                }
                else if ( y!==undefined && !isNaN(y) && y0===undefined) {
                    push({x,x0,y,y0:0,zone,step})
                }
            }
            else {
                const stepSize = step.getDuration()/10;
                
                for ( let i=0;i<10;i++) {
                    let x0 = stepStart+i*stepSize;
                    let x = x0+stepSize;
                    
                    let limit = workout.getLimits(x0+0.01);
                    let y = getMaxPower(limit,ftp);

    
                    let zone = getZone(y,ftp);
                    if (absValues && ftp) {
                        y = ftp*y/100
                    }
                    if ( y!==undefined && !isNaN(y))
                        push({x,x0,y,y0:0,zone,step})
                    
                }

            }


        }
    }
   
    return ds;
}