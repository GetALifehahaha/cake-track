import React, {useEffect, useState, useMemo} from 'react'
import { Dropdown, Button, Label } from '../components/atoms'
import { CheckoutProduct } from '../components/molecules'
import {ProductsGrid, CheckoutSection, PaymentModal, AddProductModal} from '../components/organisms/'
import { Plus } from 'lucide-react'
import DrinksData from '../data/DrinksData'

const Home = () => {
    // use auth context ot get the user

    const [checkoutProducts, setCheckoutProducts] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [grossTotal, setGrossTotal] = useState(0);
    const [discount, setDiscount] = useState(0.50);
    const [netTotal, setNetTotal] = useState(0);
    const [orderType, setOrderType] = useState("dine-in");

    const productSelection = [
        {name: "Drinks", value: "drinks"},
        {name: "Cakes", value: "cakes"},
        {name: "Cupcakes", value: "cupcakes"},
    ]


    const handleToggleCheckoutProduct = (product, removeAll) => {
        if (removeAll) {setCheckoutProducts([]); return;}
        setCheckoutProducts(cp => {
            let prod = [...cp];

            if (prod.some(p => p.id == product.id)) {
                return prod.filter(p => p.id != product.id)
            }

            return [...prod, {...product, amount: 1}];
        })
    }

    const proceedToCheckout = () => {
        setShowPaymentModal(true);
    }

    const completePayment = (value) => {
        if (value) handleToggleCheckoutProduct(null, true);
        setShowPaymentModal(false);
    }

    const proceedToAddProduct = () => setShowAddProductModal(true);

    const addProduct = (value) => {
        setShowAddProductModal(false);
    }

    // ------------------------- CHECKOUT FUNCTIONS ------------------------------------

    useMemo(() => {
        setGrossTotal(() => {
            let total = 0;

            checkoutProducts.forEach(prod => total += prod.price * prod.amount);

            return total;
        })
    }, [checkoutProducts]);

    useMemo(() => {
        setNetTotal(grossTotal - grossTotal * discount);
    }, [grossTotal])

    const handleSetOrderType = (value) => setOrderType(value);

    const handleRemoveAllProducts = () => setCheckoutProducts([]);

    const handleRemoveProductFromCheckout = (id) => {
        setCheckoutProducts(checkoutProducts => checkoutProducts.filter(product => product.id != id))
    }

    // const handleOnProceedToCheckout = () => {
    //     if (!netTotal) {
    //         return;
    //     }

    //     onProceedToCheckout(netTotal);
    // }

    const handleSetAmount = (id, value) => {
        setCheckoutProducts(prod => {
            let products = prod;
            console.log("Before:", products)
            
            products = products.map(product => {
                if (product.id == id) {
                    product.amount = value
                }

                return product;
            })
            
            console.log("After:", products)
            return products

        })
    }
    
    const listCheckoutProducts = checkoutProducts.map((product) => 
        <CheckoutProduct 
        key={product.id} 
        product={product} 
        onChangeAmount={handleSetAmount}
        onToggle={handleRemoveProductFromCheckout}/>
    )

    return (
        <div className='flex gap-4 flex-1'>
            {/* Middle */}
            <div className='flex-1 flex flex-col gap-4'>
                <div className='flex flex-row justify-between'>
                    <Dropdown selectionName='Filter Product' selections={productSelection} onSelect={(value) => console.log(value)}/>
                    <Button text='Add Item' icon={Plus} onClick={proceedToAddProduct}/>
                </div>

                <ProductsGrid products={DrinksData} checkoutProducts={checkoutProducts} onToggleCheckoutProduct={handleToggleCheckoutProduct} />
            </div>

            {/* Current Order */}
            <div className='basis-1/4 flex flex-col gap-4'>
                {/* <CheckoutSection checkoutProducts={checkoutProducts} onRemove={handleToggleCheckoutProduct} onProceedToCheckout={proceedToCheckout} onAdjustAmount={handleChangeAmount}/> */}
                <div className='w-full h-full bg-main-white rounded-4xl shadow-md shadow-black/25 flex flex-col'>
                    <div className='flex flex-row justify-between items-center text-text px-4 py-8'>
                        <div>
                            <h5 className='font-bold text-xl'>Current Order</h5>
                            <h3 className='font-base'>#1337</h3> {/* Dummy Data:*/}
                        </div>
                            <Button variant='outline' text='Clear' onClick={handleRemoveAllProducts}/>
                        </div>

                    <div className='flex flex-row gap-2 px-4'>
                        <Button variant={(orderType == "dine-in") ? 'active' : 'inactive'} size='small' text='Dine In' onClick={() => handleSetOrderType("dine-in")}/>
                        <Button variant={(orderType == "take-out") ? 'active' : 'inactive'} size='small' text='Take Out' onClick={() => handleSetOrderType("take-out")}/>
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
                        <Button variant='main' text='Proceed' onClick={proceedToCheckout}/>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showPaymentModal &&
                <PaymentModal totalPrice={netTotal} onConfirm={completePayment}/>
            }

            {showAddProductModal &&
                <AddProductModal onConfirm={addProduct}/>
            }
        </div>
    )
}

export default Home