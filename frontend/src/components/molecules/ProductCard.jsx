import { cn } from '@/utils/cn';
import { AlertCircle } from 'lucide-react';

const ProductCard = ({ product = { name: '', image: null }, onToggle, isArchived, selected = [], isPOS = false }) => {
    const isUnavailable = Boolean(product?.isUnavailable);

    const variantPrices = Array.isArray(product?.variants)
        ? product.variants
            .map((variant) => Number(variant?.price))
            .filter((price) => Number.isFinite(price) && price > 0)
        : [];

    const baseProductPrice = Number(product?.price || 0);

    const minPrice = variantPrices.length ? Math.min(...variantPrices) : 0;
    const maxPrice = variantPrices.length ? Math.max(...variantPrices) : 0;
    const hasMultiplePrices = variantPrices.length > 1 && minPrice !== maxPrice;

    const formattedPrice = hasMultiplePrices
        ? `₱ ${minPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ₱ ${maxPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `₱ ${(maxPrice || minPrice || baseProductPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const handleToggleClick = () => {
        if (isArchived) {
            onToggle(product.id)
        } else {
            onToggle(product)
        }
    };

    return (
        <div onClick={handleToggleClick} 
            className={cn('relative flex flex-col gap-4 px-2 py-2 rounded-4xl h-full shadow-md shadow-black/15 duration-200 ease-in-out min-h-60 bg-main-white border-2 border-white cursor-pointer', 
                isPOS && isUnavailable && 'opacity-60',
                selected.some(select => select === product.id) && 'border-accent-mute cursor-pointer hover:shadow-black/25')}
        >
            {isUnavailable && (
                <div className='absolute top-2 right-2 flex items-center gap-1 bg-error-fill text-error p-1.5 rounded-full z-10'>
                    <AlertCircle size={16} />
                </div>
            )}

            <div className='flex aspect-square h-40 rounded-3xl overflow-hidden justify-center items-center'>
                {product.image ?
                    <img className='object-contain rounded-3xl aspect-square h-40' src={product.image} />
                    :
                    <h5 className='font-semibold text-text/50'>
                        No Image
                    </h5>
                }
            </div>

            <div className='text-center mt-auto'>
                <h5 className='font-semibold text-xs text-accent-mute'>{formattedPrice}</h5>
                <h5 className='font-semibold text-sm'>{product.name}</h5>
            </div>
        </div>
    )
}

export default ProductCard