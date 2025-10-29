import React, {useEffect, useState} from 'react';
import { Button } from '../atoms';
import { CheckoutProduct } from '../molecules';

const CheckoutSection = ({checkoutProducts, onRemove}) => {

    const [activeButton, setActiveButton] = useState("left");

    const listCheckoutProducts = checkoutProducts.map((product) => <CheckoutProduct key={product.id} product={product} onChangeAmount={(value) => handleChangeAmount(value)} onRemove={() => handleRemoveProduct(product.id)}/>)

    const handleSetActiveButton = (direction) => setActiveButton(direction);
    const handleRemoveProduct = (id) => onRemove(id)
    const handleChangeAmount = (value) => {
        
    }

    return (
        <div className='w-full h-full bg-main-white px-4 py-8 rounded-4xl shadow-md shadow-black/25'>
            <div className='flex flex-row justify-between items-center text-text'>
                <div>
                    <h5 className='font-bold text-xl'>Current Order</h5>
                    <h3 className='font-base'>#1337</h3> {/* Dummy Data:*/}
                </div>
                <Button variant='outline' text='Clear'/>
            </div>
            <div className='flex flex-row gap-2 py-2 '>
                <Button variant={(activeButton == "left") ? 'active' : 'inactive'} size='small' text='Dine In' onClick={() => handleSetActiveButton("left")}/>
                <Button variant={(activeButton == "right") ? 'active' : 'inactive'} size='small' text='Take Out' onClick={() => handleSetActiveButton("right")}/>
            </div>

            <div className='px-4 py-8'>
                {listCheckoutProducts}
            </div>
        </div>
    )
}

export default CheckoutSection;