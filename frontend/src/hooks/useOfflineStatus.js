import { useState, useEffect, useRef } from 'react';

/** 
* @param {Object} options
* @param {Function} [options.onComeOnLine] - Callback function to be called when the browser comes online.
* @param {Function} [options.onGoOffLine] - Callback function to be called when the browser goes offline.
* @return {{ isOnline: boolean }} isOnline - A boolean value indicating whether the browser is currently online or offline.
*/

export const useOfflineStatus = ({ onComeOnLine, onGoOffLine}) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const onComeOnLineRef = useRef(onComeOnLine);
    const onGoOffLineRef = useRef(onGoOffLine);

    useEffect(() => { onComeOnLineRef.current =- onComeOnLine;}, [onComeOnLine]);
    useEffect(() => { onGoOffLineRef.current =- onGoOffLine;}, [onGoOffLine]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            onComeOnLineRef.current?.();
        }

        const handleOffline = () => {
            setIsOnline(false);
            onGoOffLineRef.current?.();
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        }
    }, []);

    return isOnline;
}