import React, {useState} from 'react';
import { Title, Label } from '../../atoms';
import { X } from 'lucide-react';
import { capitalize } from '@/utils/capitalize';
import { formatCasing } from '@/utils/formatCasing';
import { formatDateForDisplay } from '@/utils/date';
import { PreviewImage } from '../../molecules';
import { parseTimeString } from '@/utils/time';


const OrderDetails = ({ orderDetails, onClose }) => {

    const [previewImage, setPreviewImage] = useState(null);

    // Helper to get all images
    const displayImages = orderDetails.order_images && orderDetails.order_images.length > 0 
        ? orderDetails.order_images.map(img => img.image_url)
        : (orderDetails.image ? [orderDetails.image] : []);

    // const listIngredients = orderDetails?.ingredients?.length > 0
    //     ? orderDetails.ingredients.map((ingredient, index) =>
    //         <h5 key={index} className='font-light text-text text-sm'>
    //             {ingredient}
    //         </h5>
    //     )
    //     : null
    
    return (
        <>
            {previewImage && (
                <PreviewImage 
                src={previewImage} 
                onClose={() => setPreviewImage(null)} 
                />
            )}
            <div className='absolute top-0 left-0 w-full bg-black/5 backdrop-blur-xs h-screen flex justify-center items-center z-10'>
                <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[40vw] flex flex-col gap-10'>
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <Title variant='modal' text={'Order ' + orderDetails.id || 'Order Details'} />
                            <h5 className='text-text text-sm font-semibold py-1'>{orderDetails.full_name}</h5>
                            <h5 className='text-text text-sm'>Contact #: <strong>{orderDetails.phone_number}</strong></h5>
                            <h5 className='text-text text-sm'>Pickup Date: <strong>{orderDetails.due_date} : {parseTimeString(orderDetails.pickup_time)}</strong></h5>
                            <h5 className='text-text text-sm'>Order Date: <strong>{formatDateForDisplay(orderDetails.created_at)}</strong></h5>
                        </div>
                        <div>
                            <X size={16} className='text-text cursor-pointer' onClick={onClose} />
                        </div>
                    </div>

                    <hr className='text-accent-dark w-4/5 mx-auto' />

                    {/* Ingredients */}
                    {/* {listIngredients &&
                        <>
                            <div className="">
                                <Label text='Ingredient' variant='large' />
                                <div className='px-6 py-1'>
                                    {listIngredients}
                                </div>
                            </div>
                            <hr className='text-accent-dark/50 w-4/5 mx-auto' />
                        </>
                    } */}

                    {/* Cake Details */}
                    <div className="">
                        <Label text='Cake Details' variant='large' />
                        <div className='px-8 py-1 flex flex-row gap-8 justify-center'>
                            <div className='flex-1'>
                                <h5 className='text-sm text-text/75 font-medium'>Occasion: <strong className='ml-1 text-text'>{capitalize(orderDetails.cake_orders.occasion)}</strong></h5>
                                <h5 className='text-sm text-text/75 font-medium'>Flavor: <strong className='ml-1 text-text'>{capitalize(orderDetails.cake_orders.base_flavor)}</strong></h5>
                                <h5 className='text-sm text-text/75 font-medium'>Filling: <strong className='ml-1 text-text'>{capitalize(orderDetails.cake_orders.filling)}</strong></h5>
                                <h5 className='text-sm text-text/75 font-medium'>Shape: <strong className='ml-1 text-text'>{capitalize(orderDetails.cake_orders.shape)}</strong></h5>
                                <h5 className='text-sm text-text/75 font-medium'>Tier: <strong className='ml-1 text-text'>{orderDetails.cake_orders.cake_tier}-tier</strong></h5>
                            </div>
                            <div className='flex-1'>
                                <h5 className='text-sm text-text/75 font-medium'>Inscription: <strong className='ml-1 text-text'>{formatCasing(orderDetails.cake_orders.message_type)}</strong></h5>
                                <h5 className='text-sm text-text/75 font-medium'>Message: <strong className='ml-1 text-text'>{orderDetails.cake_orders.message}</strong></h5>
                                {orderDetails.cupcake_orders &&
                                    <>
                                        <h5 className='text-sm text-text/75 font-medium'>Cupcakes: <strong className='ml-1 text-text'>{orderDetails.cupcake_orders.amount}</strong></h5>
                                        <div className='px-6 py-1'>
                                            <h5 className='text-sm text-text/75 font-medium'>Frosting Color: <strong className='ml-1 text-text capitalize'>{orderDetails.cupcake_orders.frosting}</strong></h5>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Reference Images */}
                    <div className="">
                        <Label text='Reference Details' variant='large' />
                        <div className='min-h-20 flex flex-wrap gap-4 justify-center items-center py-4'>
                            {displayImages.length > 0 ? (
                                displayImages.map((src, index) => (
                                    <img 
                                        key={index}
                                        className='w-32 h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity' 
                                        src={src}
                                        onClick={() => setPreviewImage(src)}
                                        alt={`Reference ${index + 1}`}
                                    />
                                ))
                            ) : (
                                <h5 className='text-text/25 font-medium text-center'>NO IMAGE</h5>
                            )}
                        </div>
                    </div>

                    {orderDetails.comments &&
                        <div className="">
                            <Label text='Comments' variant='large' />
                            <div className='min-h-20 flex p-4'>
                                <h5 className='text-text font-base text-left'>{orderDetails.comments}</h5>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}

export default OrderDetails;