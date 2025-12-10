import { useRef, useEffect } from "react";

export default function useReelPressControls({ onNext, onPrev, cooldown = 400, moveThreshold = 30 }) {
    const state = useRef({ lastTime: 0, touching: false, moved: false, startX: 0, startY: 0 });

    useEffect(() => {
        return () => { state.current.touching = false }
    }, [])

    const allowAction = () => {
        const now = Date.now()
        if (now - state.current.lastTime < cooldown) return false
        state.current.lastTime = now
        return true
    }

    const onTouchStart = e => {

        const t = e.touches ? e.touches[0] : e
        state.current.startX = t.clientX;
        state.current.startY = t.clientY;
        state.current.moved = false;
        state.current.touching = true;

        if (allowAction()) onNext && onNext();
    }

    const onTouchMove = (e) => {
        if (!state.current.touching) return;
        const t = e.touches ? e.touches[0] : e;
        const dx = Math.abs(t.clientX - state.current.startX);
        const dy = Math.abs(t.clientY - state.current.startY);
        if (dx > moveThreshold || dy > moveThreshold) state.current.moved = true;
    };

    const onTouchEnd = () => {
        if (!state.current.touching) return;
        state.current.touching = false;
        if (!state.current.moved) {
            if (allowAction()) onPrev && onPrev();
        }
    };

    const onMouseDown = (e) => { if (e.button !== 0) return; onTouchStart(e); };
    const onMouseMove = (e) => onTouchMove(e);
    const onMouseUp = (e) => onTouchEnd(e);

    return {
        handlers: {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
            onMouseDown,
            onMouseMove,
            onMouseUp,
        }
    };
}