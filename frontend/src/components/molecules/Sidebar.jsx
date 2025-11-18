import React, {useState} from 'react'
import { SidebarConfig } from '../../config/SidebarConfig'
import { NavLink } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'

const Sidebar = () => {

    const [expanded, setExpanded] = useState(true);

    const navStyle = 'flex flex-row cursor-pointer gap-8 px-4 py-2 rounded-sm hover:bg-main-dark items-center relative font-medium ';
    const navText = expanded ? 'flex ' : 'hidden ';
    const inactiveNavStyle = 'text-text ';
    const activeNavStyle = 'text-accent hover:text-accent-dark before:content-[""] before:absolute before:w-4 before:h-full before:bg-accent before:right-[100%] before:rounded-sm  ';

    const listSidebar = SidebarConfig.map(({label, link, icon: Icon}) => 
        <NavLink 
        key={label}
        to={link}
        className={({isActive}) => ((isActive) ? navStyle+activeNavStyle : navStyle+inactiveNavStyle)}>
            <Icon width={28}/> <h5 className={navText}>{label}</h5>
        </NavLink>
    );

    const handleSetExpanded = () => {
        setExpanded(!expanded);
    }

    return (
        <div className='bg-main-white border-border border-r-2 px-2 py-2 w-fit flex flex-col'>
            <button onClick={handleSetExpanded} className={navStyle + 'font-extrabold text-md'}>
                <Menu size={28}/> 
                <div className={navText + `text-xl`}>
                    <h5 className='text-accent font-extrabold'>Cake</h5>
                    <h5 className=' text-accent-dark font-extrabold'>Track</h5>
                </div>
            </button>

            <div className='mt-16'>
                {listSidebar}
            </div>

            <NavLink
            to={'/login'}
            className={navStyle + inactiveNavStyle + 'mt-auto'}
            >
                <LogOut /> <h5 className={navText}>LOG OUT</h5>
            </NavLink>
        </div>
    )
}   

export default Sidebar