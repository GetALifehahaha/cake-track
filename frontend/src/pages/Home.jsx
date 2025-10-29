import React, {useState} from 'react'
import { Dropdown, Button } from '../components/atoms'
import {Searchbar, ProfileCard} from '../components/molecules'
import {ProductsGrid, CheckoutSection} from '../components/organisms/'
import { Plus } from 'lucide-react'
import userImage from '../assets/image/user_image.jpg'

const Home = () => {
    // use auth context ot get the user
    const user = { //temporary
        name: "Adrian Agraviador",
        role: "Cashier",
        imagePath: userImage
    }

    const [searchText, setSearchText] = useState();
    const [checkoutProducts, setCheckoutProducts] = useState([]);

    const productSelection = [
        {name: "Drinks", value: "drinks"},
        {name: "Cakes", value: "cakes"},
        {name: "Cupcakes", value: "cupcakes"},
    ]

    const handleSetSearchText = (value) => setSearchText(value);

    const logSearchText = () => console.log(searchText);

    const handleSetCheckoutProduct = (product, value) => {
        if (value) {
            setCheckoutProducts([...checkoutProducts, {...product, amount: 1}]);
        } else {
            setCheckoutProducts(cp => {
                let prod = cp.filter(p => p.id != product.id);
                
                return prod
            })
        }
    }

    const handleRemoveCheckoutProduct = (id) => {
        setCheckoutProducts(cp => {
            let prod = cp.filter(p => p.id != id);
            
            return prod
        })
    }

    return (
        <div className='w-full flex flex-row px-6 py-4 gap-4'>
            {/* Middle */}
            <div className='flex-1 flex flex-col gap-4'>
                <Searchbar onChange={(value) => handleSetSearchText(value)}/>
                <div className='flex flex-row justify-between'>
                    <Dropdown selectionName='Product Type' selections={productSelection} onSelect={(value) => console.log(value)}/>
                    <Button text='Add Item' icon={Plus} onClick={logSearchText}/>
                </div>

                <ProductsGrid onChangeCheckoutProduct={(product, value) => handleSetCheckoutProduct(product, value)} />
            </div>

            {/* Current Order */}
            <div className='basis-1/4 flex flex-col gap-4'>
                <ProfileCard user={user}/>
                <CheckoutSection checkoutProducts={checkoutProducts} onRemove={(id) => handleRemoveCheckoutProduct(id)}/>
            </div>
        </div>
    )
}

export default Home