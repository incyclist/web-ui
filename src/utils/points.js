export const getPolyline = (path) => {
    const points = path??[];
    return points.map( p => ([p.lat,p.lng]))
}
