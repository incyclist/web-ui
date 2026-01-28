const zoneColor = [
    'lightgrey', //0   lightgrey < -0.5%
    '#7f7f7f', //1   darkgrey  < 1%
    '#338cff', //2   blue      < 2%
    '#59bf59', //3   green     < 3%
    '#ffcc3f', //4   yellow    < 5%  
    '#ff5733', //5   amber     < 7%
    '#ff330c', //6   red       < 10%
    '#900c3f', //7   dark red >= 10%%
    '#C002C3' //8
];
export const getColor = (pctReality, slope = 0) => {

    const slopeVal = (pctReality !== undefined) ? pctReality / 100 * slope : slope;

    if (slopeVal < -0.5)
        return zoneColor[0];
    if (slopeVal < 1)
        return zoneColor[1];

    if (slopeVal < 2)
        return zoneColor[2];
    if (slopeVal < 3)
        return zoneColor[3];
    if (slopeVal < 5)
        return zoneColor[4];
    if (slopeVal < 7.5)
        return zoneColor[5];
    if (slopeVal < 10)
        return zoneColor[6];

    return zoneColor[7];
};
