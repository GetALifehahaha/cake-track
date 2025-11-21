import React, { useState, useMemo, useEffect } from 'react'
import { Dropdown, Button, Label } from '../components/atoms'
import { CheckoutProduct, ProductCard } from '../components/molecules'
import { PaymentModal, PaymentSuccessModal, ClearCheckoutModal} from '../components/organisms/'
import { Minus } from 'lucide-react'
import useProduct from '@/hooks/useProduct'
import { useSearchParams } from 'react-router-dom'
import useTransaction from '@/hooks/useTransaction'
import useCategory from '@/hooks/useCategory'

const Home = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const {productData, productLoading, productError} = useProduct();
    const {postTransaction, transactionLoading, transactionError, transactionResponse} = useTransaction();
    const {categoryData, categoryLoading, categoryError} = useCategory();
    const [checkoutProducts, setCheckoutProducts] = useState([]);
    const [grossTotal, setGrossTotal] = useState(0);
    const [discount, setDiscount] = useState(null);
    const [netTotal, setNetTotal] = useState(0);
    const [receivedPayment, setReceivedPayment] = useState(0);
    const [orderType, setOrderType] = useState("dine-in");
    const [filter, setFilter] = useState();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
    const [showShowClearCheckoutModal, setShowClearCheckoutModal] = useState(false);
    
    const discountSelections = {
        "Senior Citizen 20%": .20,
        "Valentines 10%": .10,
    }

    
    // SET AND TOGGLES

    const handleSetDiscount = (value) => {
        setDiscount(value)
    }

    const handleToggleCheckoutProduct = (product) => {
        setCheckoutProducts(cp => {
            let prod = [...cp];

            if (prod.some(p => p.id == product.id)) {
                return prod
            }

            return [...prod, {...product, amount: 1}];
        })
    }

    const handleSetFilter = (value) => {
        setFilter(filter => {
            if (filter == value) return null;

            return value
        })
    };

    const handleSetOrderType = (value) => setOrderType(value);

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
        removeAllProducts();
        setShowPaymentSuccessModal(!showPaymentSuccessModal);
    }


    const proceedToCheckout = () => {
        if (!netTotal) return
        setShowPaymentModal(true);
    }

    const completePayment = async (value) => {
        if (value) {
            const checkoutProductsPayload = checkoutProducts.map(p => ({
                product: p.id,                 
                product_size: p.selectedSizeId, 
                quantity: p.amount,            
                price: parseFloat(p.price)     
            }))

            await postTransaction({
                is_void: false,
                payment_method: "cash",
                transaction_items: checkoutProductsPayload,
                paid_amount: parseFloat(value)
            })

            setReceivedPayment(value);
            setShowPaymentSuccessModal(true);
        }
        setShowPaymentModal(false);
    }


    // USE EFFECTS AND MEMOS

    useEffect(() => {
        let params = new URLSearchParams();
        
        if (filter) params.set('category__name', filter)

        setSearchParams(params)
    }, [filter])
    
    useMemo(() => {
        setGrossTotal(() => {
            let total = 0;

            checkoutProducts.forEach(prod => total += prod.price * prod.amount);

            return total;
        })
    }, [checkoutProducts]);

    useMemo(() => {
        setNetTotal(grossTotal - grossTotal * discount);
    }, [grossTotal, discount])
    

    // GUARDS

    if (productLoading) return <h5>Loading</h5>
    if (productError) return <h5>Error</h5>
    if (categoryLoading) return <h5>Loading</h5>
    if (categoryError) return <h5>Error</h5>


    // MAIN FUNCTIONS

    const removeAllProducts = () => {
        setCheckoutProducts([]);
    };

    const confirmVoidPayment = () => {
        if (checkoutProducts.length > 0) setShowClearCheckoutModal(true);
    }

    const voidPayment = async (value) => {
        if (value) {
            const checkoutProductsPayload = checkoutProducts.map(p => ({
                product: p.id,                 
                product_size: p.selectedSizeId, 
                quantity: p.amount,            
                price: parseFloat(p.price)     
            }))

            await postTransaction({
                is_void: true,
                payment_method: "cash",
                transaction_items: checkoutProductsPayload,
                paid_amount: 0,
                order_type: orderType
            })

            if (transactionResponse) {
                setReceivedPayment(value);
                removeAllProducts([]);
            }
        }

        setShowClearCheckoutModal(false);
    }

    
    // LISTS AND OPTIONS

    const listCheckoutProducts = checkoutProducts.map((product) => 
        <CheckoutProduct 
        key={product.id} 
        product={product} 
        onChangeAmount={handleSetAmount}
        onToggle={handleRemoveProductFromCheckout}/>
    )

    const listProduct = productData.results.map((product) => 
        <ProductCard 
        product={product} 
        key={product.id} 
        isSelected={checkoutProducts.some(p => p.id == product.id)}
        onToggle={() => handleToggleCheckoutProduct(product)}/>
    )

    const categoryOptions = categoryData.map((cat) => { return {key: cat.name, value: cat.id}})

    return (
        <div className='flex gap-4 w-full h-full'>
            {/* Middle */}
            <div className='flex-1 flex flex-col gap-4'>
                <div className='flex flex-row gap-1 items-center'>
                    <Dropdown value={filter} selection="Filter Product" size='regular' options={categoryOptions} onSelect={handleSetFilter}/>
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
                            <Button variant='outline' text='Clear' onClick={confirmVoidPayment}/>
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
                            <div className='flex items-center'>
                                <Label variant='small' text='Discount'/>
                                <div className='flex-1' />
                                {/* <Dropdown value={discount} variant='outline' selection="Discount" options={discountSelections} onSelect={handleSetDiscount}  className='bg-main' /> */}
                                {discount>0 && <Minus className='text-text/50 ml-2 cursor-pointer' onClick={() => handleSetDiscount(0)} />}
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

            {showShowClearCheckoutModal && 
                <ClearCheckoutModal onConfirm={voidPayment} />
            }
        </div>
    )
}

export default Home