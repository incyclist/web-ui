import { useState, useEffect, } from 'react';

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  
  return {
    width,
    height
  };
}

export const useWindowDimensions = (onResize,ref)=> {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    const handleResize = () => {
      const prev = windowDimensions;
      
      if (onResize)
        onResize( getWindowDimensions(),prev )
      else 
        setWindowDimensions(getWindowDimensions());
    }

    const target = ref?.current? ref.current : window
    target.addEventListener('resize', handleResize);

    return () => {
      target.removeEventListener('resize', handleResize);
    }
  }, [onResize, ref, windowDimensions]);

  return windowDimensions;
}

const getDivDimensions = (target) => {
  if (!target) {
    return {width:0, height:0}
  }

  const { innerWidth: width, innerHeight: height } = target;
  
  return {
    width,
    height
  };
}

export const useDivDimensions = (onResize,ref)=> {

  const [windowDimensions, setWindowDimensions] = useState(getDivDimensions(ref.current));

  useEffect(() => {
    const handleResize = () => {
      const prev = windowDimensions;
      
      if (onResize)
        onResize( getWindowDimensions(),prev )
      else 
        setWindowDimensions(getWindowDimensions());
    }

    let div = ref.current
    if (ref.current)
      ref.current.addEventListener('resize', handleResize);

    return () => {
      if (div)
        div.removeEventListener('resize', handleResize);
    }
  }, [onResize, ref, windowDimensions]);

  return windowDimensions;
}