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
        console.log({
            message,
            type
        })

        setTimeout(() => {
            removeToast(id);
        }, 5000);

    }, [removeToast])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            <div className='fixed bottom-5 left-5 z-1000 flex flex-col gap-4'>
                {toasts.map((toast) => (
                    <div key={toast.id}
                        className={`
                            px-4 py-3 rounded-md text-white transition-all duration-100 translate-y-0 opacity-100 flex flex-row items-center gap-2
                            ${toast.type === "error" ? 'bg-error-fill ' : ''}
                            ${toast.type === "success" ? 'bg-success-fill ' : ''}
                            ${toast.type === "info" ? 'bg-accent-mute ' : ''}
                        `}>
                        {toast.type === "error" ? <CircleAlert className='text-error' /> : ''}
                        {toast.type === "success" ? <CircleCheck className='text-success' /> : ''}
                        {toast.type === "info" ? <Info className='text-accent-dark' /> : ''}
                        <h5
                            className={`
                            ${toast.type === "error" ? 'text-error ' : ''}
                            ${toast.type === "success" ? 'text-success ' : ''}
                            ${toast.type === "info" ? 'text-accent-dark ' : ''}
                        `}>{toast.message}</h5>
                        <X className={`
                            ${toast.type === "error" ? 'text-error ' : ''}
                            ${toast.type === "success" ? 'text-success ' : ''}
                            ${toast.type === "info" ? 'text-accent-dark ' : ''}
                        `} onClick={() => removeToast(toast.id)} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}