import React from 'react';
import { Title, Label } from '../atoms';
import { X } from 'lucide-react';

const OrderDetails = ({ orderDetails, onClose }) => {

    // const listIngredients = orderDetails?.ingredients?.length > 0
    //     ? orderDetails.ingredients.map((ingredient, index) =>
    //         <h5 key={index} className='font-light text-text text-sm'>
    //             {ingredient}
    //         </h5>
    //     )
    //     : null
    const capitalize = (str) => str[0].toUpperCase() + str.slice(1)

    return (
        <div className='absolute top-0 left-0 w-full bg-black/5 backdrop-blur-xs h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[40vw] flex flex-col gap-10'>
                <div className="flex justify-between items-start w-full">
                    <div>
                        <Title variant='modal' text={'Order ' + orderDetails.id || 'Order Details'} />
                        <h5 className='text-text text-sm font-semibold py-1'>{orderDetails.full_name}</h5>
                        <h5 className='text-text text-sm'>Contact #: {orderDetails.phone_number}</h5>
                        <h5 className='text-text text-sm'>Date: {orderDetails.due_date}</h5>
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
                            <h5 className='text-sm'><strong>Flavor: </strong>{capitalize(orderDetails.cake_orders.base_flavor)}</h5>
                            <h5 className='text-sm'><strong>Finish: </strong>{capitalize(orderDetails.cake_orders.finish)}</h5>
                            <h5 className='text-sm'><strong>Filling: </strong>{capitalize(orderDetails.cake_orders.filling)}</h5>
                            <h5 className='text-sm'><strong>Shape: </strong>{capitalize(orderDetails.cake_orders.shape)}</h5>
                            <h5 className='text-sm'><strong>Tier: </strong>{orderDetails.cake_orders.cake_tier}-tier</h5>
                        </div>
                        <div className='flex-1'>
                            <h5 className='text-sm'><strong>Inscription: </strong>{orderDetails.cake_orders.message_tyoe}</h5>
                            <h5 className='text-sm'><strong>Message: </strong>{orderDetails.cake_orders.message}</h5>
                            {orderDetails.cupcake_orders &&
                                <>
                                    <h5 className='text-sm'><strong>Cupcake_orderss: </strong>{orderDetails.cupcake_orders.amount}</h5>
                                    <div className='px-6 py-1'>
                                        <h5 className='text-sm'><strong>Flavor: </strong>{orderDetails.cupcake_orders.flavor}</h5>
                                        <h5 className='text-sm'><strong>Finish: </strong>{orderDetails.cupcake_orders.finish}</h5>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>

                {/* Reference Images */}
                <div className="">
                    <Label text='Reference Details' variant='large' />
                    <div className='min-h-20 flex justify-center items-center'>
                        <h5 className='text-text/25 font-medium text-center'>NO IMAGE</h5>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails;