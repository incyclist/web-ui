export const getCardSize = (w,h,padding = 12,offs = 210) => {
    const available = Math.max(220, w - offs)
    const cards = Math.max(1, Math.floor(available / 280))
    const width = Math.min(332, Math.floor(available / cards))
    const height = Math.max(510, Math.ceil((width - padding) * 9 / 16 + 332))
    return {
        height,
        width,
        padding
    }
}

export const getResponsiveHorizontal = (w,h,props)=>{

    const {offset=0,padding=0} = props??{}

    const cardSize = getCardSize(w,h,padding,offset)
    const stepSize = cardSize.width

    const responsive = {cardSize}
    let i=0;
    let cnt=1;

    while ( i+stepSize<w*2) {
        const items = i===0 ? 1 : cnt++
        const key = i===0 ? `${Math.round(i)}` : `${Math.round(i+(offset||0))}`
        responsive[key] = { items, itemsFit:'contain'};
        i+=stepSize;
    }
    return responsive
}

export const getResponsiveVertical = (width, height)=>{
    const cardSize = getCardSize(width,height)
    const stepSize = cardSize.width+5

    const responsive = {}
    let i=0;
    let cnt=1;

    while ( i+stepSize<width*2) {
        const items = i===0 ? 1 : cnt++
        responsive[`${Math.round(i)}`] = { items};
        i+=stepSize;
    }
    return responsive
}
