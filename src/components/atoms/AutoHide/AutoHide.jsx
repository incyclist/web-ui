import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';
import { copyPropsExcluding } from '../../../utils/props';
import { useUnmountEffect } from '../../../hooks';

const DEFAULT_DELAY = 10000;

export const AutoHide = forwardRef(({
    children,
    delay = DEFAULT_DELAY,
    onChangeVisible,
    pinned = false,
    id,
    ...props
}, ref) => {

    const [hidden, setHidden] = useState(false);
    const timerStartRef = useRef(undefined);
    const hoveredRef = useRef(false);
    const intervalRef = useRef(undefined);
    const mountedRef = useRef(undefined);

    const show =  useCallback((updateView = false) => {
        const wasHidden = hidden;
        timerStartRef.current = Date.now();
        setHidden(false);

        if (wasHidden && updateView && typeof onChangeVisible === 'function') {
            onChangeVisible(true);
        }
    },[hidden, onChangeVisible]);


    const hide = useCallback( (updateView = false) => {

        if (pinned)
            return
        const wasHidden = hidden;
        timerStartRef.current = undefined;
        setHidden(true);

        if (!wasHidden && updateView && typeof onChangeVisible === 'function') {
            onChangeVisible(false);
        }
    },[hidden, onChangeVisible, pinned]);

    const isHidden = useCallback(() => {
        return hidden;
    }, [hidden]);


    useImperativeHandle(ref, () => ({
        show,
        hide,
        isHidden
    }));


    const onMouseOver = () => {
        hoveredRef.current = true;
        show(true);
    };

    const onMouseLeave = () => {
        hoveredRef.current = false;
    };

    const onCheckHide = useCallback(() => {
        if (hoveredRef.current) return;

        if (timerStartRef.current === undefined && pinned && !hidden) {
            return;
        }

        if (timerStartRef.current === undefined && !pinned && hidden) {
            return;
        }

        if (timerStartRef.current === undefined) {
            timerStartRef.current = Date.now();
        }

        if (delay === -1) return;

        if (pinned) {
            if (hidden) {
                show(true);
            } else {
                timerStartRef.current = undefined;
            }
            return;
        }

        const tNow = Date.now();
        if (tNow > timerStartRef.current + delay) {
            hide(true);
        }
    }, [delay, pinned, hidden, show, hide]);

    useEffect(() => {
        if (mountedRef.current) 
            return;

        mountedRef.current = true;
        show(false);
        
    }, [show]);

    useEffect(() => {
        

        if (!pinned && !intervalRef.current) {
            intervalRef.current = setInterval(onCheckHide, 100);
        }
        if (pinned && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;

        }
    }, [onCheckHide, pinned, show]);

    useUnmountEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
        }
        mountedRef.current = false;
    });

    const childProps = copyPropsExcluding(props, ['children', 'delay', 'onChangeVisible', 'pinned']);

    if (!children) return null;
    if (typeof children === 'string' || typeof children === 'number') return children;

    const renderWrappedChild = (child, idx) => {
        if (!child) return null;
        if (typeof child === 'string' || typeof child === 'number') return child;
        if (!React.isValidElement(child)) return null;

        // clone child so props are merged safely, but keep a stable wrapper element
        const mergedProps = { ...child.props, ...childProps, onMouseOver, onMouseLeave };

        return (
            <div
                key={idx}
                onMouseOver={onMouseOver}
                onMouseLeave={onMouseLeave}
                style={{ opacity: hidden ? 0 : 1 }}
            >
                {React.cloneElement(child, mergedProps)}
            </div>
        );
    };

    if (Array.isArray(children)) {
        return <>{children.map((child, idx) => renderWrappedChild(child, idx))}</>;
    } else {
        return <>{renderWrappedChild(children)}</>;
    }
});

