import React, { useContext, useState } from 'react'
import { SidebarConfig } from '../../config/SidebarConfig'
import { NavLink } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { AuthContext } from '@/context/AuthContext'

const Sidebar = () => {

    const { user, logout } = useContext(AuthContext);

    const role = user?.groups[0]
    const isAdmin = user?.is_staff || false

    const filteredSidebar = SidebarConfig.filter((item) => item.allowedRoles.includes(isAdmin ? 'admin' : role))

    const [expanded, setExpanded] = useState(true);

    const navStyle = 'text-sm flex flex-row cursor-pointer gap-6 px-4 py-2 rounded-sm hover:bg-main-dark items-center relative font-medium ';
    const navText = expanded ? 'flex ' : 'hidden ';
    const inactiveNavStyle = 'text-text ';
    const activeNavStyle = 'text-accent hover:text-accent-dark before:content-[""] before:absolute before:w-4 before:h-full before:bg-accent before:right-[100%] before:rounded-sm  ';

    const listSidebar = filteredSidebar.map(({ label, link, icon: Icon }) =>
        <NavLink
            key={label}
            to={link}
            className={({ isActive }) => ((isActive) ? navStyle + activeNavStyle : navStyle + inactiveNavStyle)}>
            <div className="w-6 flex justify-center">
                <Icon size={24} />
            </div>
            <h5 className={navText}>{label}</h5>
        </NavLink>
    );

    const handleSetExpanded = () => {
        setExpanded(!expanded);
    }

    return (
        <div
            className={`
                bg-main-white border-border border-r-2 px-2 py-2
                flex flex-col overflow-hidden
                transition-all duration-300
                ${expanded ? 'w-64' : 'w-20'}
            `}
        >
            <button onClick={handleSetExpanded} className={navStyle + 'font-extrabold text-sm'}>
                <Menu size={28} />
                {expanded && (
                    <div className={navText + ' text-lg'}>
                        <h5 className='text-accent font-extrabold'>Cake</h5>
                        <h5 className='text-accent-dark font-extrabold'>Track</h5>
                    </div>
                )}
            </button>

            <div className='mt-16'>
                {listSidebar}
            </div>

            <div className={navStyle + inactiveNavStyle + ' mt-auto'} onClick={logout}>
                <LogOut />
                {expanded && <h5 className={navText}>LOG OUT</h5>}
            </div>
        </div>
    )
}

export default Sidebar