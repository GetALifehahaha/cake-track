import React from 'react'
import {Searchbar} from '../components/molecules'
import { Dropdown, Button } from '../components/atoms'
import { Plus } from 'lucide-react'
import ProductsGrid from '../components/organisms/ProductsGrid'

const Home = () => {

    const productSelection = [
        {name: "Drinks", value: "drinks"},
        {name: "Cakes", value: "cakes"},
        {name: "Cupcakes", value: "cupcakes"},
    ]

    return (
        <div className='w-full flex flex-row px-6 py-4'>
            {/* Middle */}
            <div className='flex-1 flex flex-col gap-2'>
                <Searchbar />
                <div className='flex flex-row justify-between'>
                    <Dropdown selectionName='Product Type' selections={productSelection} onSelect={(value) => console.log(value)}/>
                    <Button text='Add Item' icon={Plus}/>
                </div>

                <ProductsGrid />
            </div>

            {/* Current Order */}
            <div className='basis-1/4'>
                Hi
            </div>
        </div>
    )
}

export default Home