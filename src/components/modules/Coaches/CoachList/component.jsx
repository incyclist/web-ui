import React from 'react';
import { Table } from '../../../molecules';

export const CoachList = (props) => { 

    const onDelete = ( coach) => {
        if ( props.onDelete)
            props.onDelete(coach.idx)
    }

    const onEdit = ( coach) =>{
        if ( props.onEdit)
            props.onEdit(coach.idx)
    }
    
    
    const {coaches=[],rows=3} = props;
    const maxRows = coaches.length<rows ? coaches.length : rows;
    const getCoachData = () => coaches.map ( (c,i) => {
            const {power,speed} = c;
            return {...c, idx:i, config:{power,speed}}            
    })

    const formatConfig = (s) => {
        if (!s) return '';
        if (s.power && !s.speed)
            return `${Math.round(s.power)}W`
        if (!s.power && s.speed)
            return `${Math.round(s.speed)}km/h`
        return `${Math.round(s.power)}W,${Math.round(s.speed)}km/h`                
    }

    const formatLead = v => {
        
        return v ? `${ Number(v/1000).toFixed(1)} km` : '-'            
    }

    const data = getCoachData()

    const tableProps = {
        data,
        columns: {
            fields:['name','config','lead'],
            format:[undefined,formatConfig,formatLead] ,
            align:['left','right','right'],
            width:['20vw','6vw','4vw']
        },
        headers: ['Name', 'Configuration', 'Lead']
    };

    if (coaches.length===0)
        return <div>no coaches added</div>

    return <Table {...tableProps} rows={maxRows} onDelete={onDelete} onEdit={onEdit} />
 
}