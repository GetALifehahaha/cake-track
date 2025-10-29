import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/molecules'


const Layout = () => {

    return (
        <div className='w-screen h-screen bg-main flex flex-row'>
            <Sidebar />
            
            <Outlet />
        </div>
    )
}

export default Layout