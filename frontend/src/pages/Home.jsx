import React, {useState} from 'react'
import { Dropdown, Button } from '../components/atoms'
import {Searchbar, ProfileCard} from '../components/molecules'
import {ProductsGrid, CheckoutSection, PaymentModal} from '../components/organisms/'
import { Plus } from 'lucide-react'
import userImage from '../assets/image/user_image.jpg'
import DrinksData from '../data/DrinksData'

const Home = () => {
    // use auth context ot get the user
    const user = { //temporary
        name: "Adrian Agraviador",
        role: "Cashier",
        imagePath: userImage
    }

    const [searchText, setSearchText] = useState();
    const [checkoutProducts, setCheckoutProducts] = useState([]);
    const [netTotal, setNetTotal] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const productSelection = [
        {name: "Drinks", value: "drinks"},
        {name: "Cakes", value: "cakes"},
        {name: "Cupcakes", value: "cupcakes"},
    ]

    const handleSetSearchText = (value) => setSearchText(value);

    const logSearchText = () => console.log(searchText);

    const handleToggleCheckoutProduct = (product, removeAll) => {
        if (removeAll) {setCheckoutProducts([]); return;}
        setCheckoutProducts(cp => {
            let prod = [...cp];

            if (prod.some(p => p.id == product.id)) {
                return prod.filter(p => p.id != product.id)
            }

            return [...prod, product]
        })
    }

    const proceedToCheckout = (value) => {
        setNetTotal(value);

        setShowPaymentModal(true);
    }

    const completePayment = (value) => {
        setShowPaymentModal(false);
    }

    return (
        <div className='w-full flex flex-row px-6 py-4 gap-4'>
            {/* Middle */}
            <div className='flex-1 flex flex-col gap-4'>
                <Searchbar onChange={(value) => handleSetSearchText(value)}/>
                <div className='flex flex-row justify-between'>
                    <Dropdown selectionName='Filter Product' selections={productSelection} onSelect={(value) => console.log(value)}/>
                    <Button text='Add Item' icon={Plus} onClick={logSearchText}/>
                </div>

                <ProductsGrid products={DrinksData} checkoutProducts={checkoutProducts} onToggleCheckoutProduct={handleToggleCheckoutProduct} />
            </div>

            {/* Current Order */}
            <div className='basis-1/4 flex flex-col gap-4'>
                <ProfileCard user={user}/>
                <CheckoutSection checkoutProducts={checkoutProducts} onRemove={handleToggleCheckoutProduct} onProceedToCheckout={proceedToCheckout}/>
            </div>

            {/* Modals */}
            {showPaymentModal &&
                <PaymentModal totalPrice={netTotal} onConfirm={completePayment}/>
            }
        </div>
    )
}

export default Home