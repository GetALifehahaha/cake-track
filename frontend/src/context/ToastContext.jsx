import React, { createContext, useState, useCallback, useContext } from 'react'
import { CircleAlert, Info, CircleCheck, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    return useContext(ToastContext)
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    })

    const addToast = useCallback((message, type = "success") => {
        const id = Date.now()

        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 5000);

    }, [removeToast])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            <div className='fixed bottom-5 right-5 z-1000 flex flex-col gap-4 '>
                {toasts.map((toast) => (
                    <div key={toast.id}
                        className={`
                            px-5 py-4 rounded-xl text-sm font-semibold text-white transition-all flex flex-row items-center gap-2 bg-neutral-900 animate-in fade-in
                        `}>
                        {toast.type === "error" ? <CircleAlert className='text-error' /> : ''}
                        {toast.type === "success" ? <CircleCheck className='text-success' /> : ''}
                        {toast.type === "info" ? <Info className='text-accent-dark' /> : ''}
                        <h5
                            className={`
                        `}>{toast.message}</h5>
                        <X className={`
                        `} onClick={() => removeToast(toast.id)} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}