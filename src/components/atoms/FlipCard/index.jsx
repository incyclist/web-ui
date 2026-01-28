import { EventLogger } from 'gd-eventlog'
import React, { useRef, useState }  from 'react'
import styled from 'styled-components'

const Card = styled.div`
    background-color: transparent;
    width: ${props => props.width};
    height:${props => props.height};
    visibility: ${props => props.hidden? 'hidden' : undefined}
    transition-delay: ${props => props.delay||'1s'};
    perspective: 1000px; /* Remove this if you don't want the 3D effect */
    
    &:hover {
        transform: ${props=> props.disableFlip ? undefined: 'rotateY(180deg)'};
        border-style: solid;
        border-width: 5px;
        border-color: white;
    }
` 

const FlippedCard = styled.div`
    background-color: transparent;    
    width: 100%;
    height:100%;
` 

const CardInner = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transition-delay: ${props => props.delay||'1s'};
    transform-style: preserve-3d;   
    &:hover {
        transform: ${props=> props.disableFlip ? undefined: 'rotateY(180deg)'};
    
    }
` 

const FlippedCardInner = styled.div`
    position:relative;
    width: 100%;
    height: 100%;
    text-align: center;
` 

const Front = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden; /* Safari */
    backface-visibility: hidden;
    background: ${props => props.background};
` 


const Back = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden; /* Safari */
    backface-visibility: hidden;
    background: ${props => props.background};
    transform: rotateY(-180deg);


` 

const Rotated = styled.div`
    transform: rotateY(-180deg);
` 

export const FlipCard = ( {children, padding,hidden=false,delay=1000, cardId, logData={},flipOnClick=false, noAutoFlip, width, height,background, onFlipped})=>{
    const logger = new EventLogger('Incyclist')
    const delayStr = `${Number(delay/1000).toFixed(1)}s`
    const data = typeof(logData)==='object' ? logData : {logData}

    const cardRef = useRef()
    const innerRef = useRef()
    const disableFlip = children.filter(c=>c!==null).length!==2
    const logDelay = 3000
    
    let to

    const [flipped,setFlipped] = useState(false)
    
    const onMouseEnter = ()=>{
        
        if (disableFlip || noAutoFlip)        
            return;

        to = setTimeout( ()=>{
            notify()
            to =null;

        },logDelay)
    }

    const notify=()=>{
        if (!flipped)
            return;
        if (cardId || data) {
            logger.logEvent({message:'card flipped', card:cardId,...logData, eventSource:'user'})
        }
        if (onFlipped)
            onFlipped(cardId,logData,Date.now())
    }

    const onMouseLeave = ()=>{ 
        if (disableFlip)        
        return;

        if (to) {
            clearTimeout(to)
            to = null;
        }
    }

    const flip = () =>{
        onMouseLeave()
        notify()
        setFlipped(true)
    }

    const onClick =()=> {
        if (disableFlip)        
        return;

        if (!flipOnClick)
            return;

        flip()
    }


    const onFlippedMouseLeave = ()=> {
        setFlipped(false)
    }


    if (flipped) {   
        return <FlippedCard width={width} height={height} >     
            <FlippedCardInner>
                <Front  background={background} onMouseLeave={onFlippedMouseLeave}>
                    {children[1]}
                </Front>
                
            </FlippedCardInner>
        </FlippedCard>
    }

    return (

        
    <Card className='flip-card' width={width} height={height} padding={padding} delay={delayStr} ref={cardRef} disableFlip={disableFlip}
          onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}> 

        <CardInner delay={delayStr} ref={innerRef} disableFlip={disableFlip}> 
            <Front background={background}>
                {children[0]}
            </Front>
            <Back background={background} >
                <Rotated>
                    {children[1]}
                </Rotated>
                
            </Back>
        </CardInner>
    </Card>
    )
}