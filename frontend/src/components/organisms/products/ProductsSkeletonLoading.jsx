import { Shimmer } from "@/components/molecules";

const ProductCardSkeleton = () => (
    <div className='flex flex-col gap-4 px-2 py-2 rounded-4xl shadow-md shadow-black/15 min-h-60 bg-main-white'>
        {/* Image area */}
        <Shimmer className='aspect-square h-40 rounded-3xl w-full' />

        {/* Name label */}
        <div className='flex justify-center mt-auto px-4'>
            <Shimmer className='h-3.5 w-2/3 rounded-full' />
        </div>
    </div>
);

const ToolbarSkeleton = () => (
    <div className='flex flex-row justify-between'>
        {/* Left: dropdown + archive button */}
        <div className='flex items-center gap-2'>
            <Shimmer className='h-9 w-36 rounded-xl' />
            <Shimmer className='h-9 w-28 rounded-xl' />
        </div>
        {/* Right: manage discounts, categories, add item */}
        <div className='flex items-center gap-4'>
            <Shimmer className='h-9 w-40 rounded-xl' />
            <Shimmer className='h-9 w-44 rounded-xl' />
            <Shimmer className='h-9 w-28 rounded-xl' />
        </div>
    </div>
);

const PaginationSkeleton = () => (
    <div className='flex justify-center gap-2 pt-2'>
        <Shimmer className='h-8 w-20 rounded-lg' />
        <Shimmer className='h-8 w-20 rounded-lg' />
    </div>
);

const ProductsSkeletonLoading = ({ count = 14 }) => (
    <div className='flex flex-col gap-8'>
        <ToolbarSkeleton />

        <div className='flex flex-col h-[75vh] justify-between'>
            <div className='overflow-x-auto flex items-center flex-col gap-2'>
                <div className='grid grid-cols-7 p-2 gap-4 w-full flex-wrap'>
                    {Array.from({ length: count }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>

            <PaginationSkeleton />
        </div>
    </div>
);

export default ProductsSkeletonLoading;