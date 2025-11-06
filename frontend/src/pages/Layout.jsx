import React, {useState} from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, Searchbar, ProfileCard } from '../components/molecules'
import userImage from '../assets/image/user_image.jpg'

const Layout = () => {

    const [searchText, setSearchText] = useState();

    const user = { //temporary
        name: "Adrian Agraviador",
        role: "Cashier",
        imagePath: userImage
    }

    const handleSetSearchText = (value) => setSearchText(value);

    return (
        <div className='w-screen h-screen bg-main flex flex-row'>
            <Sidebar />

            <div className='w-full flex flex-col px-6 py-4 gap-8'>
                <div className='flex justify-between'>
                    <span className='basis-1/2'>
                        <Searchbar onChange={(value) => handleSetSearchText(value)}/>
                    </span>
                    <ProfileCard user={user}/>
                </div>
                <Outlet />
            </div>
        </div>
    )
}

export default Layout