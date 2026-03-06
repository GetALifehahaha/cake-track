import React, {useContext, useState} from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, Searchbar, ProfileCard } from '../components/molecules'
import userImage from '../assets/image/user_image.jpg'
import { AuthContext } from '@/context/AuthContext'
import { Button } from '@/components/atoms'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

const Layout = () => {

    const [searchText, setSearchText] = useState('');
    const {user} = useContext(AuthContext);
    const [searchParams, setSearchParam] = useSearchParams();

    const handleSetSearchText = (value) => setSearchText(value);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        params.set('q', searchText);
        setSearchParam(params);
    }

    return (
        <div className='w-full h-screen bg-main flex'>
            <Sidebar />

            <div className='flex-1 flex flex-col px-6 py-4 gap-8 overflow-y-auto'>
                <div className='flex justify-between'>
                    <span className='basis-1/2 flex items-center gap-2'>
                        <Searchbar onChange={(value) => handleSetSearchText(value)}/>
                        <Button icon={Search} text='' variant='icon' className='rounded-2xl' onClick={handleSearch}/>
                    </span>
                    <ProfileCard user={user}/>
                </div>

                <Outlet/>
            </div>
        </div>
    )
}

export default Layout