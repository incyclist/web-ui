import { useEffect, useRef } from 'react';

export const useUnmountEffect = (effect, dependencies) => {
    if (typeof effect !== 'function') {
        console.error('Effect must be a function');
    }

    const componentWillUnmount = useRef(false);

    useEffect(() => () => {
        componentWillUnmount.current = true;
    }, []);

    useEffect(() => () => {
        if (componentWillUnmount.current) {
            effect();
        }
    }, [effect,dependencies]);
};
