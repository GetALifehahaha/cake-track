import React, { useState, useMemo } from 'react'
import { Dropdown, Button, Label } from '../components/atoms'
import { CheckoutProduct, ProductCard } from '../components/molecules'
import { PaymentModal, PaymentSuccessModal, } from '../components/organisms/'
import DrinksData from '../data/DrinksData'

const Home = () => {
    // use auth context ot get the user
    
    const [checkoutProducts, setCheckoutProducts] = useState([]);
    const [grossTotal, setGrossTotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [netTotal, setNetTotal] = useState(0);
    const [receivedPayment, setReceivedPayment] = useState(0);
    const [orderType, setOrderType] = useState("dine-in");

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
    
    const discountSelections = {
        "Senior Citizen": .20,
        "Valentines": .10,
    }

    const productSelection = [
        {name: "Drinks", value: "drinks"},
        {name: "Cakes", value: "cakes"},
        {name: "Cupcakes", value: "cupcakes"},
    ]


    const handleToggleCheckoutProduct = (product) => {
        setCheckoutProducts(cp => {
            let prod = [...cp];

            if (prod.some(p => p.id == product.id)) {
                return prod.filter(p => p.id != product.id)
            }

            return [...prod, {...product, amount: 1}];
        })
    }

    const proceedToCheckout = () => {
        if (!netTotal) return
        setShowPaymentModal(true);
    }

    const completePayment = (value) => {
        if (value) {
            setReceivedPayment(value);
            setShowPaymentSuccessModal(true);
        }
        setShowPaymentModal(false);
    }

    // ------------------------- PRODUCTS FUNCTIONS -------------------------------------

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
        console.log(netTotal)
    }, [grossTotal])

    const handleSetOrderType = (value) => setOrderType(value);

    const handleRemoveAllProducts = () => setCheckoutProducts([]);

    const handleRemoveProductFromCheckout = (id) => {
        setCheckoutProducts(checkoutProducts => checkoutProducts.filter(product => product.id != id))
    }

    const handleSetAmount = (id, value) => {
        setCheckoutProducts(prod => {
            let products = prod;
            
            products = products.map(product => {
                if (product.id == id) {
                    product.amount = value
                }

                return product;
            })
            
            return products

        })
    }

    const handleTogglePaymentSuccessModal = () => {
        handleRemoveAllProducts();
        setShowPaymentSuccessModal(!showPaymentSuccessModal);
    }
    
    const listCheckoutProducts = checkoutProducts.map((product) => 
        <CheckoutProduct 
        key={product.id} 
        product={product} 
        onChangeAmount={handleSetAmount}
        onToggle={handleRemoveProductFromCheckout}/>
    )

    const listProduct = DrinksData.map((product) => 
        <ProductCard 
        product={product} 
        key={product.id} 
        isSelected={checkoutProducts.some(p => p.id == product.id)}
        onToggle={() => handleToggleCheckoutProduct(product)}/>
    )

    const listDiscounts = Object.entries(discountSelections).map(([key, value], index) => 
        <option key={index} value={value}>{key}: {value*100}%</option>
    )

    return (
        <div className='flex gap-4 flex-1'>
            {/* Middle */}
            <div className='flex-1 flex flex-col gap-4'>
                <div className='flex flex-row justify-between'>
                    <Dropdown selectionName='Filter Product' selections={productSelection} onSelect={(value) => console.log(value)}/>
                </div>

            {/* Product Section */}
                <div className='grid grid-cols-5 p-2 gap-4 w-full flex-wrap overflow-x-auto'>
                    {listProduct}
                </div>
            </div>

            {/* Checkout Section */}
            <div className='basis-1/4 flex flex-col gap-4'>
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
                                <select className='w-fit p-0.5 rounded-lg border-2 border-border border-dotted text-text font-semibold text-sm text-right' onChange={(e) => setDiscount(e.target.value)}>
                                    <option className='mr-2' value={0}>No discount</option>
                                    {listDiscounts}
                                </select>
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

            {showPaymentSuccessModal && 
                <PaymentSuccessModal totalAmount={netTotal} amountReceived={receivedPayment} onClose={handleTogglePaymentSuccessModal} />
            }
        </div>
    )
}

export default Home