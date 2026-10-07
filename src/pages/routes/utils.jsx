export const getCardSize = (w,h,padding,offs) => {
    let height = Math.round( 0.3*h/10)*10
    let width = 235 / 132 *height/2+padding
    const offset = offs ||210

    try {

        const cards = Math.floor(w/width)
        const usedSpace = Math.floor(w/width)*width+offset+cards*1
        if (usedSpace >= w) {
            width = Math.floor((w-offset-cards*5)/cards)
            height = width/235*132*2
        }
    }
    catch(err) {
        console.log(err)
    }

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
