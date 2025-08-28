
import { useState, useRef, useCallback } from 'react';

export const useStopwatch = () => {
    const [time, setTime] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const start = useCallback(() => {
        if (intervalRef.current !== null) return;
        startTimeRef.current = Date.now() - time * 1000;
        intervalRef.current = window.setInterval(() => {
            if(startTimeRef.current !== null) {
                setTime((Date.now() - startTimeRef.current) / 1000);
            }
        }, 50); // Update every 50ms for smooth display
    }, [time]);

    const stop = useCallback(() => {
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        stop();
        setTime(0);
    }, [stop]);

    return { time, start, stop, reset };
};
