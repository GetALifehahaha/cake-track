import { X, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

const CheckoutProduct = ({ product, pricing, onChangeAmount, maxAmount = 99 }) => {

    const beforePrice = Number(pricing?.before ?? (product.price * product.amount || 0));
    const afterPrice = Number(pricing?.after ?? beforePrice);
    const isDiscounted = Boolean(pricing?.isApplicable && afterPrice < beforePrice);
    const disableAdd = Number(product.amount) >= Number(maxAmount);

    let intervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);


    const startHold = (method) => {
        handleSetAmount(method);
        intervalRef.current = setInterval(() => {
            handleSetAmount(method);
        }, 200);
    }

    const stopHold = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }

    const handleSetAmount = (method) => {
        if (method == "minus") {
            onChangeAmount(product.variant_id, product.amount - 1);
        } else if (method == "add") {
            if (disableAdd) return
            if (product.amount + 1 === 100) return
            onChangeAmount(product.variant_id, product.amount + 1);
        }

    }

    return (
        <div className='flex flex-row gap-8 w-full items-center px-4'>
            <div>
                <h5 className='font-medium text-sm'>{product.name}</h5>
                <div className='flex items-center gap-2'>
                    {isDiscounted ? (
                        <div className='flex items-center gap-1.5'>
                            <h5 className='font-semibold text-accent-text text-xs'>₱ {afterPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                            <h5 className='font-medium text-xs text-text/40 line-through'>₱ {beforePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                        </div>
                    ) : (
                        <h5 className='font-semibold text-accent-text text-sm'>₱ {beforePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                    )}
                    <h5 className='font-semibold text-xs p-0.5 bg-white text-accent border rounded-md px-1 min-w-8 text-center border-accent'>{product.label}</h5>
                </div>
            </div>

            <div className='flex flex-row items-center gap-2 ml-auto'>
                <button className='text-accent border border-accent p-0.5 rounded-full cursor-pointer'
                    onMouseDown={() => startHold("minus")}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                >
                    <Minus size={12} />
                </button>
                <h5 className={cn('text-text font-sm w-6 text-center', product.amount == 99 && 'font-semibold')}>{product.amount}</h5>
                <button
                    disabled={disableAdd}
                    className={cn('text-accent border border-accent p-0.5 rounded-full cursor-pointer', disableAdd && 'opacity-40 cursor-not-allowed')}
                    onMouseDown={() => startHold("add")}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                >
                    <Plus size={12} />
                </button>
            </div>
        </div>
    )
}

export default CheckoutProduct;