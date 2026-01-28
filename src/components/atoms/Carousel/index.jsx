import React, {  memo, useEffect,useRef, useState } from "react";
import styled from "styled-components";
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

import { AutoHide,Button } from "../../atoms";


const View = styled.div`
    width: 100%;
    height: ${props => props.height};
    display: block;
    padding-top: 1vh; 
    padding-bottom: 1vh;     
`

const PrevNextButton = styled(Button)` 
    justify-content: center;
    align-items: center;
    text-align: center;
    z-index:100;
    display: block;
    font-size: 3vh;
    position: absolute;
    top: calc(50% - 2.5vh);
    width: 40px;
    min-width: 40px;
    height: 5vh;
    min-height: 5vh;
    background-color: #333;
    --background-clip: content-box;
    border: 0.25rem solid transparent;
    margin: 0;
    padding: 0;
    opacity: 50%;
    transition: all 0.2s;
    &:hover {
        opacity: 80%;
        border-style: solid;
        border-width: 5px;
        border-color: white;
    }
`

const NextButton = styled(PrevNextButton)`
    right:10px;
`

const PrevButton = styled(PrevNextButton)`
    left:10px;
`

const renderNext = (props) => { 
    return <AutoHide delay={3000}><NextButton {...props} longPressDelay={500} propagate={true}>&gt;</NextButton></AutoHide>
    //return <NextButton {...props} propagate={true}>&gt;</NextButton>
}

const renderPrev = (props) => {
    
    
    return <AutoHide delay={1}><PrevButton {...props} longPressDelay={500}  propagate={true}>&lt;</PrevButton></AutoHide>
}


const getSlideItemInfo = (state) => {
	const { itemsInSlide, activeIndex, infinite, itemsCount, isStageContentPartial } = state || {};

	if (isStageContentPartial) {
		return { isPrevSlideDisabled: true, isNextSlideDisabled: true };
	}

	const isPrevSlideDisabled = infinite === false && activeIndex === 0;
	const isNextSlideDisabled = infinite === false && itemsCount - itemsInSlide <= activeIndex;

	return { isPrevSlideDisabled, isNextSlideDisabled };
};

class ExtAliceCarousel extends AliceCarousel {
	_renderPrevButton() {
		const { isPrevSlideDisabled } = getSlideItemInfo(this.state);
        if (isPrevSlideDisabled)
            return null;
		return (
            <AutoHide delay={1}>
                    <PrevButton name="prev"
				        onClick={this.slidePrev}
				        isDisabled={isPrevSlideDisabled} longPressDelay={100}  propagate={true}>
                        &lt;
                    </PrevButton>
            </AutoHide>

		);
	}

	_renderNextButton() {
        
		const { isNextSlideDisabled } = getSlideItemInfo(this.state);
        if (isNextSlideDisabled)
            return null;

		return (
            <AutoHide delay={3000}>
                <NextButton name="next"
				onClick={this.slideNext}
				isDisabled={isNextSlideDisabled} longPressDelay={100} propagate={true}>&gt;</NextButton>
            </AutoHide>


		);
	}

}



export const CarouselComponent = ({width,height,cards, renderKey,responsive,onInitialized,onSlideChange,onSlideChanged,onUpdated }) => {

    const [items,setItems] = useState(cards)
    const callbacks = {onInitialized,onSlideChange,onSlideChanged,onUpdated }

    const refCarousel = useRef(null)

    useEffect( ()=>{
        if (cards!==items) {
            setItems(cards)
        }
    },[cards,items])

    return <View height={height} width={width} >
        <ExtAliceCarousel ref={refCarousel} renderKey={renderKey}  
            mouseTracking  touchTracking  items={items} responsive={responsive} 
            
            renderNextButton={renderNext} 
            renderPrevButton={renderPrev} disableDotsControls 
            {...callbacks}
        />

    </View> 
}

export const Carousel = memo(CarouselComponent)

