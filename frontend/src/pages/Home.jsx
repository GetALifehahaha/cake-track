import React, { useState, useMemo, useEffect } from 'react'
import { Dropdown, Button, Label, Title } from '../components/atoms'
import { CheckoutProduct, ModalFeedbackCard, Pagination, ProductCard } from '../components/molecules'
import { PaymentModal, PaymentSuccessModal, ClearCheckoutModal, VariantModal, HomeSkeleton } from '../components/organisms/'
import { Lock } from 'lucide-react'
import useProduct from '@/hooks/useProduct'
import { useSearchParams } from 'react-router-dom'
import useTransaction from '@/hooks/useTransaction'
import useCategory from '@/hooks/useCategory'
import useDiscount from '@/hooks/useDiscount'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/utils/cn'
import Modal from '@/components/molecules/Modal'
import useBusinessDetails from '@/hooks/useBusinessDetails'

const Home = () => {

    const { addToast } = useToast();

    const [searchParams, setSearchParams] = useSearchParams();
    const {data: productData, loading: productLoading, error: productError} = useProduct();
    const { postTransaction, loading: transactionLoading, error: transactionError, transactionResponse } = useTransaction();
    const {data: businessData, loading: businessLoading, error: businessError} = useBusinessDetails();
    const { categoryData, categoryLoading, categoryError } = useCategory();
    const { discountData, discountLoading, discountError } = useDiscount();
    const [checkoutProducts, setCheckoutProducts] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [voidProducts, setVoidProducts] = useState([]);

    const [grossTotal, setGrossTotal] = useState(0);
    const [discount, setDiscount] = useState();
    const [discountValue, setDiscountValue] = useState(0);
    const [netTotal, setNetTotal] = useState(0);
    const [receivedPayment, setReceivedPayment] = useState(0);
    const [orderType, setOrderType] = useState("dine-in");
    const [filter, setFilter] = useState();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
    const [showClearCheckoutModal, setShowClearCheckoutModal] = useState(false);
    const [showVoid, setShowVoid] = useState(false);
    const [prepProduct, setPrepProduct] = useState(false);


    const [actualAccessCode, setActualAccessCode] = useState();
    const [accessCode, setAccessCode] = useState();

    const [modalFeedbackContent, setModalFeedbackContent] = useState({});
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    // SET AND TOGGLES

    const handleSetDiscount = (value) => {
        setDiscount(value)

        const discount = discountData.find(d => d.id === value)
        setDiscountValue(value ? discount.rate : null)
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
                if (product.variant_id == id) {
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

    const itemInVoid = (variant_id) => {
        return voidProducts.some(prod => prod.variant_id == variant_id);
    }

    // USE EFFECTS AND MEMOS

    useEffect(() => {
        let params = new URLSearchParams();

        if (filter) params.set('categories__name', filter)

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
        setNetTotal(grossTotal - grossTotal * discountValue);
    }, [grossTotal, discountValue, discount])

    useMemo(() => {
        setActualAccessCode(businessData.secret_pin)
    }, [])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(checkoutProducts));
    }, [checkoutProducts]);


    // GUARDS

    if (productLoading || categoryLoading || transactionLoading || discountLoading || businessLoading ) return <HomeSkeleton />
    if (productError) return <h5>Error</h5>
    if (categoryError) return <h5>Error</h5>
    if (transactionError) return <h5>Error</h5>
    if (discountError) return <h5>Error</h5>
    if (businessError) return <h5>Error</h5>


    // MAIN FUNCTIONS

    const addToCheckout = (product, amount) => {
        setCheckoutProducts(prev => {
            if (prev.some(prod => prod.variant_id === product.variant_id)) {
                return prev
            }

            return [...prev, {...product, amount}]
        })

        setPrepProduct(null)
        setModalFeedbackContent(null)
    }


    const handlePrepProduct = (product) => {
        if (product.variants.length === 1) addToCheckout({
            ...product, 
            variant_id: product.variants[0].id, 
            label: product.variants[0].label, 
            price: product.variants[0].price, 
        }, 1)
        else setPrepProduct(product)
    }

    const toggleAllVoidItems = () => {
        if (checkoutProducts.length === voidProducts.length) {
            setVoidProducts([]);        
        } else {
            setVoidProducts(checkoutProducts);
        }
    }
    const addToVoid = (product) => {
        setVoidProducts(vp => {
            let prod = [...vp];

            if (itemInVoid(product.variant_id)) {
                return prod.filter(p => p.variant_id != product.variant_id);
            }
            
            return [...prod, product];
        })
    }

    const proceedToCheckout = () => {
        if (!netTotal) return
        setShowPaymentModal(true);
    }

    
    const confirmAccessCode = () => {
        if (accessCode != actualAccessCode) {
            setModalFeedbackContent({
                type: "error",
                label: "Wrong Access Code",
                details: "Please enter the correct access code"
            })
            setShowModalFeedback(true);
            return;
        }

        voidPayment();
    }

    const completePayment = async (value) => {
        if (value) {
            const checkoutProductsPayload = checkoutProducts.map(p => ({
                product: p.id,
                product_variant: p.variant_id,
                quantity: p.amount,
            }))

            await postTransaction({
                is_void: false,
                payment_method: "cash",
                transaction_items: checkoutProductsPayload,
                paid_amount: parseFloat(value),
                discount: discount,
            })

            setReceivedPayment(value);
            setShowPaymentSuccessModal(true);
            removeAllProducts();

            addToast("Transaction successful")
        }
        setShowPaymentModal(false);
        setModalFeedbackContent(null);
    }

    const removeAllProducts = () => {
        setCheckoutProducts([]);
    };

    const confirmVoidPayment = () => {
        if (voidProducts.length > 0) setShowClearCheckoutModal(true);
    }

    const voidPayment = async () => {
        const voidProductsPayload = voidProducts.map(p => ({
            product: p.id,
            product_variant: p.variant_id,
            quantity: p.amount,
        }))

        await postTransaction({
            is_void: true,
            payment_method: "cash",
            transaction_items: voidProductsPayload,
            paid_amount: 0,
            order_type: orderType,
        })

        setCheckoutProducts(cp => cp.filter(p => !itemInVoid(p.variant_id)));
        setVoidProducts([]);
        addToast("Transction voided successfully");
        setAccessCode('');
        localStorage.removeItem('cart');

        setShowClearCheckoutModal(false);
    }


    // LISTS AND OPTIONS

    const listCheckoutProducts = checkoutProducts.map((product, index) =>
        <CheckoutProduct
            key={index}
            product={product}
            onChangeAmount={handleSetAmount}
            onToggle={handleRemoveProductFromCheckout} />
    )

    const listProduct = productData.results.map((product) =>
        <ProductCard
            product={product}
            key={product.id}
            isSelected={checkoutProducts.some(p => p.variant_id == product.variant_id)}
            onToggle={handlePrepProduct} />
    )

    const listVoidProducts = checkoutProducts.map((product) => 
        <div 
        key={product.variant_id} 
        className={cn('relative flex flex-row border-2 border-border rounded-xl gap-8 w-full items-center px-4 py-1.5 cursor-pointer hover:bg-border active:-translate-y-2 transition-transform duration-200', {'opacity-50': itemInVoid(product.variant_id)})}
        onClick = {() => addToVoid(product)}
        >
            {itemInVoid(product.variant_id) &&
                <div className='bg-error w-2 h-2 aspect-square rounded-sm absolute -translate-x-5' />
            }

            <div>
                <h5 className='font-medium text-sm'>{product.name}</h5>
                <div className='flex items-center gap-2'>
                    <h5 className='font-medium text-sm text-text/50'>{product.label}</h5>
                    <h5 className='font-semibold text-accent-text text-sm'>₱ {Number(product.price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                </div>
            </div>
        </div>
    )

    const categoryOptions = categoryData.map((cat) => { return { key: cat.name, value: cat.id } });
    const discountOptions = discountData.map((dis) => { return { key: dis.name, value: dis.id } });

    return (
        <div className='flex gap-4 w-full h-full'>
            {/* Middle */}
            <div className='flex-1 flex flex-col gap-4'>
                <div className='flex flex-row gap-1 items-center'>
                    <Dropdown value={filter} selection="Filter Product" size='regular' forPageFilter={true} options={categoryOptions} onSelect={handleSetFilter} />
                </div>

                {/* Product Section */}
                {productData.results.length == 0 ?
                    <div className='flex justify-center items-center h-full'>
                        <h5 className='text-sm font-medium text-text/50'>
                            No products to show
                        </h5>
                    </div>
                    :
                    <div className='h-[70vh] overflow-y-auto flex items-center flex-col gap-2'>
                        <div className='grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-2 gap-4 w-full flex-wrap'>
                            {listProduct}
                        </div>
                    </div>
                }

                <Pagination prev={productData.previous} next={productData.next} />
            </div>


            {/* Checkout Section */}
            <div className='basis-1/4 flex flex-col gap-4'>
                <div className='w-full h-full bg-main-white rounded-4xl shadow-md shadow-black/25 flex flex-col'>
                    <div className='flex flex-row justify-between items-center text-text px-4 py-8'>
                        <div>
                            <h5 className='font-bold text-xl'>Current Order</h5>
                        </div>
                        {/* <Button variant='outline' text='Clear' onClick={confirmVoidPayment} /> */}
                        <Button variant='outline' text={showVoid ? 'Cancel' : 'Clear'} onClick={() => setShowVoid(!showVoid)} />
                    </div>

                    <div className='flex flex-row gap-2 px-4'>
                        <Button variant={(orderType == "dine-in") ? 'active' : 'inactive'} size='small' text='Dine In' onClick={() => handleSetOrderType("dine-in")} />
                        <Button variant={(orderType == "take-out") ? 'active' : 'inactive'} size='small' text='Take Out' onClick={() => handleSetOrderType("take-out")} />
                    </div>

                    <div className={cn('px-4 py-8 flex flex-col gap-4 h-[45vh] overflow-y-auto', showVoid && 'h-[50vh]')}>
                        {showVoid ?
                            listVoidProducts
                            :
                            listCheckoutProducts
                        }
                    </div>
                    
                    {showVoid ?
                        <div className='mt-auto ml-auto w-full border-t border-l border-r py-6 px-8 border-border rounded-2xl flex flex-col gap-4'>
                            <div className='flex flex-row items-center justify-between w-full mb-2'>
                                <h5 className='font-semibold text-sm text-text/50'>
                                    {voidProducts.length} item(s) selected
                                </h5>
                                <Button variant='outline' text={checkoutProducts.length === voidProducts.length ? 'Unselect All' : 'Select All'} size='small' onClick={toggleAllVoidItems} />
                            </div>
                            <hr className='text-border'></hr>
                            <Button variant='main' text='Void Items' onClick={confirmVoidPayment} />
                        </div>
                        :
                        <div className={cn('mt-auto ml-auto w-full border-t border-l border-r py-6 px-8 border-border rounded-2xl flex flex-col gap-4',
                            {'opacity-50 pointer-events-none': showVoid}
                        )}>
                            <div className='flex flex-col gap-2 '>
                                <div className='flex items-center justify-between'>
                                    <Label variant='small' text={`Items (${checkoutProducts.length})`} />
                                    <h5 className='text-text font-semibold text-sm'>₱ {Number(grossTotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                                </div>
                                <div className='flex items-center'>
                                    <Label variant='small' text='Discount' />
                                    <div className='flex-1' />
                                    <Dropdown value={discount} variant='outline' selection="Discount" size='fit' options={discountOptions} onSelect={handleSetDiscount} className='bg-main' />
                                </div>
                            </div>
                            <hr className='text-border'></hr>
                            <div className='flex items-center justify-between'>
                                <Label variant='small' text='Total' />
                                <h5 className='text-text font-semibold text-sm'>₱ {Number(netTotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                            </div>
                            <Button variant='main' text='Proceed' onClick={proceedToCheckout} />
                        </div>
                    }
                </div>
            </div>

            {/* Modals */}
            {showPaymentModal &&
                <PaymentModal totalPrice={netTotal} onConfirm={completePayment} onClose={() => setShowPaymentModal(false)}/>
            }

            {showPaymentSuccessModal && transactionResponse &&
                <PaymentSuccessModal totalAmount={netTotal} amountReceived={receivedPayment} onClose={handleTogglePaymentSuccessModal} 
                    transactionData={transactionResponse.data}
                />
            }

            {showClearCheckoutModal &&
                <Modal onClose={() => setShowClearCheckoutModal(false)}>
                    <div className='flex flex-col justify-center items-center gap-4'>
                        <div className='bg-accent-mute/20 text-accent-mute p-4 rounded-full w-fit'>
                            <Lock size={36}/>
                        </div>
                        <h5 className='font-bold text-xl'>Access Code Required</h5>
                        <h5 className='text-text/75 font-medium'>Enter the 4-digit access code to void items</h5>
                    </div>

                    <input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} type='password' maxLength={4} className='mx-auto bg-accent-mute/20 p-4 rounded-xl border-4 border-border font-medium text-lg tracking-widest text-center focus:outline-none focus:border-accent-mute' placeholder='ENTER CODE'/>

                    { showModalFeedback &&
                        <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                    }

                    <div className='flex gap-4 ml-auto'>
                        <Button variant='modalOutline' size='modalSize' text='Cancel' onClick={() => setShowClearCheckoutModal(false)}/>
                        <Button variant='modalBlock' size='modalSize' text='Verify' onClick={confirmAccessCode}/>
                    </div>
                </Modal>
            }

            {prepProduct &&
                <VariantModal product={prepProduct} onClose={() => setPrepProduct(null)} onChoose={addToCheckout}/>
            }
        </div>
    )
}

export default Home