import React from 'react';
import { Title, Label } from '../atoms';
import { X } from 'lucide-react';

const OrderDetails = ({orderDetails, onClose}) => {

    const listIngredients = orderDetails?.ingredients?.length > 0 
        ? orderDetails.ingredients.map((ingredient, index) => 
            <h5 key={index} className='font-light text-text text-sm'>
                {ingredient}
            </h5>
        )
        : null

    return (
        <div className='absolute top-0 left-0 w-full bg-black/5 backdrop-blur-xs h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[40vw] flex flex-col gap-10'>
                <div className="flex justify-between items-start w-full">
                    <div>
                        <Title variant='modal' text={'Order ' + orderDetails.id || 'Order Details'} />
                        <h5 className='text-text text-sm'>{orderDetails.client}</h5>
                        <h5 className='text-text text-sm'>Contact #:{orderDetails.contact}</h5>
                    </div>
                    <div>
                        <X size={16} className='text-text cursor-pointer' onClick={onClose}/>

                    </div>
                </div>

                <hr className='text-accent-dark w-4/5 mx-auto'/>

                {/* Ingredients */}
                {listIngredients &&
                    <>
                        <div className="">
                            <Label text='Ingredient' variant='large' />
                            <div className='px-6 py-1'>
                                {listIngredients}
                            </div>
                        </div>
                        <hr className='text-accent-dark/50 w-4/5 mx-auto'/>
                    </>
                }

                {/* Cake Details */}
                <div className="">
                        <Label text='Cake Details' variant='large' />
                        <div className='px-8 py-1 flex flex-row gap-8 justify-center'>
                            <div className='flex-1'>
                                <h5 className='text-sm'><strong>Flavor: </strong>{orderDetails.cake.flavor}</h5>
                                <h5 className='text-sm'><strong>Finish: </strong>{orderDetails.cake.finish}</h5>
                                <h5 className='text-sm'><strong>Filling: </strong>{orderDetails.cake.filling}</h5>
                                <h5 className='text-sm'><strong>Shape: </strong>{orderDetails.cake.shape}</h5>
                                <h5 className='text-sm'><strong>Tier: </strong>{orderDetails.cake.tier}</h5>
                            </div>
                            <div className='flex-1'>
                                <h5 className='text-sm'><strong>Inscription: </strong>{orderDetails.cake.inscription}</h5>
                                <h5 className='text-sm'><strong>Message: </strong>{orderDetails.cake.inscription_message}</h5>
                                {orderDetails.cupcake &&
                                    <>
                                        <h5 className='text-sm'><strong>Cupcakes: </strong>{orderDetails.cupcake.amount}</h5>
                                        <div className='px-6 py-1'>
                                            <h5 className='text-sm'><strong>Flavor: </strong>{orderDetails.cupcake.flavor}</h5>
                                            <h5 className='text-sm'><strong>Finish: </strong>{orderDetails.cupcake.finish}</h5>
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