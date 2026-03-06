const ProductCardSkeleton = () => (
    <div className='flex flex-col gap-4 px-2 py-2 rounded-4xl shadow-md shadow-black/15 min-h-60 bg-main-white'>
        <div className='flex aspect-square h-40 rounded-3xl overflow-hidden justify-center items-center bg-border animate-pulse' />
        <div className='text-center mt-auto flex justify-center'>
            <div className='h-4 w-3/4 rounded-full bg-border animate-pulse' />
        </div>
    </div>
)

const HomeSkeleton = () => {
    return (
        <div className='flex gap-4 w-full h-full'>

            {/* Middle - Product Section */}
            <div className='flex-1 flex flex-col gap-4'>

                {/* Filter Dropdown */}
                <div className='flex flex-row gap-1 items-center'>
                    <div className='h-9 w-36 rounded-xl bg-border animate-pulse' />
                </div>

                {/* Product Grid */}
                <div className='h-[70vh] overflow-y-auto flex items-center flex-col gap-2'>
                    <div className='grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-2 gap-4 w-full flex-wrap'>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>

                {/* Pagination */}
                <div className='flex justify-center gap-2'>
                    <div className='h-8 w-20 rounded-lg bg-border animate-pulse' />
                    <div className='h-8 w-20 rounded-lg bg-border animate-pulse' />
                </div>
            </div>

            {/* Checkout Section */}
            <div className='basis-1/4 flex flex-col gap-4'>
                <div className='w-full h-full bg-main-white rounded-4xl shadow-md shadow-black/25 flex flex-col'>

                    {/* Header */}
                    <div className='flex flex-row justify-between items-center px-4 py-8'>
                        <div className='h-6 w-32 rounded-full bg-border animate-pulse' />
                        <div className='h-8 w-16 rounded-lg bg-border animate-pulse' />
                    </div>

                    {/* Order Type Tabs */}
                    <div className='flex flex-row gap-2 px-4'>
                        <div className='h-7 w-20 rounded-lg bg-border animate-pulse' />
                        <div className='h-7 w-20 rounded-lg bg-border animate-pulse' />
                    </div>

                    {/* Checkout Items */}
                    <div className='px-4 py-8 flex flex-col gap-4 h-[45vh]'>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className='flex flex-row items-center gap-3'>
                                <div className='h-10 w-10 rounded-xl bg-border animate-pulse shrink-0' />
                                <div className='flex flex-col gap-1.5 flex-1'>
                                    <div className='h-3.5 w-3/4 rounded-full bg-border animate-pulse' />
                                    <div className='h-3 w-1/2 rounded-full bg-border animate-pulse' />
                                </div>
                                <div className='h-4 w-12 rounded-full bg-border animate-pulse' />
                            </div>
                        ))}
                    </div>

                    {/* Totals & CTA */}
                    <div className='mt-auto w-full border-t border-l border-r py-6 px-8 border-border rounded-2xl flex flex-col gap-4'>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center justify-between'>
                                <div className='h-3.5 w-20 rounded-full bg-border animate-pulse' />
                                <div className='h-3.5 w-16 rounded-full bg-border animate-pulse' />
                            </div>
                            <div className='flex items-center justify-between'>
                                <div className='h-3.5 w-16 rounded-full bg-border animate-pulse' />
                                <div className='h-7 w-24 rounded-lg bg-border animate-pulse' />
                            </div>
                        </div>
                        <hr className='text-border' />
                        <div className='flex items-center justify-between'>
                            <div className='h-3.5 w-12 rounded-full bg-border animate-pulse' />
                            <div className='h-3.5 w-20 rounded-full bg-border animate-pulse' />
                        </div>
                        <div className='h-10 w-full rounded-xl bg-border animate-pulse' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeSkeleton