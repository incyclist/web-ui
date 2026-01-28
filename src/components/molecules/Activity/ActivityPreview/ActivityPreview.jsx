import React from "react"
import { LineSeries, VerticalBarSeries, XYPlot } from "react-vis"
import { Center, Loader, Row,Autosize,AutoHide } from "../../../atoms"
import { copyPropsExcluding } from "../../../../utils/props"
import { average } from "../../../../utils/coding"
import { getZone, zoneColor } from "../utils"

const ActivityPreviewRaw = ({loading,activity,ftp,width,height}) => { 
    //const [data, setData] = useState(false)
    
    const lineColor = 'white'
        
    const getData = () => {

        let power=[], elevation=[]

        try {
            const getColor = (P) => {
                const ftpVal = activity?.user?.ftp??ftp
                if (!ftpVal)
                    return 'lightgray'
        
                return zoneColor[getZone(P/ftpVal*100)]
            }
            const logs  = (activity?.logs??[]).filter(l=>l!==undefined)
        
            if (!logs||logs.length===0) {
                return({power,elevation})
                
            }        

    
            const dpp = Math.floor(logs.length/width)
            const totalTime = logs[logs.length-1].time
            if (dpp<1) {
                for (let  i=0;i<width;i++) { 
                    const timeTarget = totalTime/width*i
                    const log = logs.find(l => l.time>=timeTarget)
                    if (!log)
                        continue;
                    power.push({x: timeTarget, y: log.power, color:getColor(log.power)})
                    elevation.push({x: timeTarget, y: log.elevation})
                }
            }
            else {
                let prevIdx = 0;
                for (let  i=0;i<width;i++) { 
                    try {
                        const timeTarget = totalTime/width*i
                        let logIdx = logs.findIndex(l => l.time>=timeTarget) 
                        if (logIdx===-1)
                            logIdx = logs.length-1

                        const log = {}
                        const values = logs.slice(prevIdx,logIdx)
                        log.power = average( values,'power' )
                        log.elevation = average( values,'elevation' )

                        if ( isNaN(log.power) || isNaN(log.elevation) ) {
                            log.power = logs[prevIdx].power
                            log.elevation = logs[prevIdx].elevation
                        }
                        else {
                            power.push({x: timeTarget, y: log.power, color:getColor(log.power)})
                            elevation.push({x: timeTarget, y: log.elevation})
    
                        }
                        prevIdx = logs[logIdx]===timeTarget ? logIdx+1 : logIdx

                    }
                    catch(err) {
                        console.log(err)
                    }
                }

            }

    
        }
        catch(err) {
            console.log(err)
        }

        return({power,elevation})

    }
    

    const data = getData()

    if (!width)
        return null;


    if ( loading || !data)
        return (            
            <Row width={`${width}px`} height={`${height}px`}>
                <AutoHide delay={3000}>
                    <Center>
                        <Loader type='clip'/>
                    </Center>            
                </AutoHide>
            </Row>
        )
    return (
            <XYPlot height={height} width={width} margin={{bottom: 1, left: 1, right: 1, top: 1}}>
                <VerticalBarSeries colorType='literal' data={data.power} /> 
                {data.elevation ? <LineSeries colorType='literal' color={lineColor}  data={data.elevation} /> : null}
            </XYPlot>
    
        
    )            
    
    
}

export const ActivityPreview = (props)  => {

    const {width,height} =props
    const childProps = copyPropsExcluding(props, ['width','height'])
    return (
        <Autosize width={width} height={height}>
            <ActivityPreviewRaw {...childProps}/>
        </Autosize>
    )
}