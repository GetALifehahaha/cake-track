import React from 'react';
import { CheckCircle } from 'lucide-react';

const InventoryDashboardCard = ({title="Title", subtitle="Subtitle", icon: Icon, amount=0, variant="success"}) => {

    const bgVariants = {
        success: 'bg-success',
        error: 'bg-error',
        warning: 'bg-warning',
        none: 'bg-none',
        missing: 'bg-missing',
    }

    const beforeBgVariants = {
        success: 'before:bg-success',
        error: 'before:bg-error',
        warning: 'before:bg-warning',
        none: 'before:bg-none',
        missing: 'before:bg-missing',
    }

    const softBgVariants = {
        success: 'bg-success-fill',
        error: 'bg-error-fill',
        warning: 'bg-warning-fill',
        none: 'bg-none-fill',
        missing: 'bg-missing-fill',
    }
    
    const textVariants = {
        success: 'text-success',
        error: 'text-error',    
        warning: 'text-warning',
        none: 'text-none',
        missing: 'text-missing',
    }
    
    const borderVariants = {
        success: 'border-success-border',
        error: 'border-error-border',
        warning: 'border-warning-border',
        none: 'border-none-border',
        missing: 'border-missing-border',
    }

    return (
        <div className={`bg-main-white p-6 border ${borderVariants[variant]} rounded-lg flex flex-row gap-8 items-center relative
        before:content-[""] before:w-1 before:h-full before:left-0 before:top-0 before:-translate-x-full before:rounded-l-full ${beforeBgVariants[variant]} before:absolute
        `}>
            <div className={`p-3 rounded-md h-fit ${softBgVariants[variant]}`}>
                <Icon size={28} className={`${textVariants[variant]}`} />
            </div>

            <div className='font-semibold flex flex-col items-start gap-2'>
                <h5 className='text-xs text-text/50'>{title}</h5>
                <h5 className={`text-xl ${textVariants[variant]}`}>{amount}</h5>
                <h5 className={`text-xs px-4 py-0.5 rounded-full text-center ${softBgVariants[variant]} ${textVariants[variant]}`}>{subtitle}</h5>
            </div>
        </div>
    )
}

export default InventoryDashboardCard;