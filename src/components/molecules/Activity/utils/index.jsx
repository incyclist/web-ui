export const getZone = (pctFtp) => {
    if ( pctFtp<=55)
        return 1;
    if ( pctFtp<=75)
        return 2;
    if ( pctFtp<=90)
        return 3;
    if ( pctFtp<=105)
        return 4;
    if ( pctFtp<=120)
        return 5;
    if ( pctFtp<=150)
        return 6;
    return 7;
}

export const zoneColor = [
    'white',        //0
    '#7f7f7f',      //1
    '#338cff',      //2
    '#59bf59',      //3
    '#ffcc3f',      //4
    '#ff6639',      //5
    '#ff330c',      //6
    '#ea39ff'       //7
]
