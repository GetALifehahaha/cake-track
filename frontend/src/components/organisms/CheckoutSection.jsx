import React, {useEffect, useMemo, useState} from 'react';
import { Button, Label } from '../atoms';
import { CheckoutProduct } from '../molecules';

const CheckoutSection = ({checkoutProducts, onRemove}) => {

    const [activeButton, setActiveButton] = useState("left");
    const [grossTotal, setGrossTotal] = useState(0);
    const [discount, setDiscount] = useState(0.50);
    const [netTotal, setNetTotal] = useState(0);

    useMemo(() => {
        let price = 0;
        checkoutProducts.forEach(product => {
            price += product.price;
        });
        setGrossTotal(price);
    }, [checkoutProducts]);

    useMemo(() => {
        setNetTotal(grossTotal - grossTotal * discount);
    }, [grossTotal]);

    const listCheckoutProducts = checkoutProducts.map((product) => 
        <CheckoutProduct 
        key={product.id} 
        product={product} 
        onChangeAmount={() => handleSetTotal(amount)}
        onToggle={() => onRemove(product, false)}/>)

    const handleSetActiveButton = (direction) => setActiveButton(direction);

    const handleRemoveAllProducts = () => onRemove(null, true);
    
    return (
        <div className='w-full h-full bg-main-white rounded-4xl shadow-md shadow-black/25 flex flex-col'>
            <div className='flex flex-row justify-between items-center text-text px-4 py-8'>
                <div>
                    <h5 className='font-bold text-xl'>Current Order</h5>
                    <h3 className='font-base'>#1337</h3> {/* Dummy Data:*/}
                </div>
                <Button variant='outline' text='Clear' onClick={handleRemoveAllProducts}/>
            </div>

            <div className='flex flex-row gap-2 px-4'>
                <Button variant={(activeButton == "left") ? 'active' : 'inactive'} size='small' text='Dine In' onClick={() => handleSetActiveButton("left")}/>
                <Button variant={(activeButton == "right") ? 'active' : 'inactive'} size='small' text='Take Out' onClick={() => handleSetActiveButton("right")}/>
            </div>

            <div className='px-4 py-8 flex flex-col gap-4'>
                {listCheckoutProducts}
            </div>

            <div className='mt-auto ml-auto w-full border-t border-l border-r py-6 px-8 border-border rounded-2xl flex flex-col gap-4'>
                <div className='flex flex-col gap-2 '>
                    <div className='flex items-center justify-between'>
                        <Label variant='small' text={`Items (${checkoutProducts.length})`}/>
                        <h5 className='text-text font-semibold text-sm'>₱ {Number(grossTotal || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                    </div>
                    <div className='flex items-center justify-between'>
                        <Label variant='small' text='Discount'/>
                        <h5 className='w-20 p-0.5 rounded-lg border-2 border-border border-dotted text-text font-semibold text-sm text-right'>{`${discount*100} %`}</h5>
                    </div>
                </div>
                <hr className='text-border'></hr>
                <div className='flex items-center justify-between'>
                    <Label variant='small' text='Total'/>
                    <h5 className='text-text font-semibold text-sm'>₱ {Number(netTotal || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                </div>
                <Button variant='main' text='Proceed'/>
            </div>
        </div>
    )
}

export default CheckoutSection;