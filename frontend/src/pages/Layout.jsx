import React, { useContext, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, Searchbar, ProfileCard } from '../components/molecules'
import { AuthContext } from '@/context/AuthContext'
import { Button } from '@/components/atoms'
import { Search, Bell } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import useQueryFetch from '@/hooks/useQueryFetch'
import API_ENDPOINTS from '@/api/endpoints'
import { useNavigate } from 'react-router-dom'

const Layout = () => {

    const [searchText, setSearchText] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams, setSearchParam] = useSearchParams();
    const location = useLocation();
    const path = location.pathname;
    const isAdmin = Boolean(user?.is_staff);
    const hideSearchbar =
        path.includes('reports') ||
        path.endsWith('/queue') ||
        path.includes('details');

    const ordersDashboardQuery = useQueryFetch(
        ['admin-notifications-orders-dashboard'],
        API_ENDPOINTS.ORDERS_DASHBOARD,
        undefined,
        {
            enabled: isAdmin,
            staleTime: 60 * 1000,
            refetchInterval: isAdmin ? 15 * 60 * 1000 : false,
        }
    );

    const ingredientAllQuery = useQueryFetch(
        ['admin-notifications-ingredients-all'],
        API_ENDPOINTS.INGREDIENTS_ALL,
        undefined,
        {
            enabled: isAdmin,
            staleTime: 60 * 1000,
            refetchInterval: isAdmin ? 15 * 60 * 1000 : false,
        }
    );

    const refundRequestsQuery = useQueryFetch(
        ['admin-notifications-refund-requests'],
        API_ENDPOINTS.ORDERS,
        { cancellation_requested: 'true', page_size: 1 },
        {
            enabled: isAdmin,
            staleTime: 60 * 1000,
            refetchInterval: isAdmin ? 15 * 60 * 1000 : false,
        }
    );

    const pendingOrdersCount = Number(ordersDashboardQuery.data?.pending_orders || 0);
    const ingredientList = ingredientAllQuery.data || [];
    const lowStockCount = ingredientList.filter(item => Number(item.total_stock || 0) > 0 && Number(item.total_stock || 0) < Number(item.low_amount || 0)).length;
    const outOfStockCount = ingredientList.filter(item => Number(item.total_stock || 0) <= 0).length;
    const refundRequestsCount = Number(refundRequestsQuery.data?.count || 0);
    const totalNotificationCount = pendingOrdersCount + refundRequestsCount + lowStockCount + outOfStockCount;

    const notifications = [
        {
            id: 'new-orders',
            label: 'New Orders',
            details: pendingOrdersCount > 0 ? `${pendingOrdersCount} pending order${pendingOrdersCount > 1 ? 's' : ''}` : 'No new orders',
            count: pendingOrdersCount,
            onClick: () => navigate('/queue/pending'),
        },
        {
            id: 'inventory-low',
            label: 'Inventory Low Stock',
            details: lowStockCount > 0 ? `${lowStockCount} item${lowStockCount > 1 ? 's' : ''} below threshold` : 'No low stock items',
            count: lowStockCount,
            onClick: () => navigate('/inventory?filter=available'),
        },
        {
            id: 'refund-requests',
            label: 'Refund Requests',
            details: refundRequestsCount > 0 ? `${refundRequestsCount} refund request${refundRequestsCount > 1 ? 's' : ''} pending` : 'No refund requests',
            count: refundRequestsCount,
            onClick: () => navigate('/queue/pending?cancellation_requested=true'),
        },
        {
            id: 'inventory-out',
            label: 'Inventory Out of Stock',
            details: outOfStockCount > 0 ? `${outOfStockCount} item${outOfStockCount > 1 ? 's' : ''} out of stock` : 'No out-of-stock items',
            count: outOfStockCount,
            onClick: () => navigate('/inventory?filter=out_of_stock'),
        },
    ];

    const handleSetSearchText = (value) => {
        if (value.length === 0) {
            searchParams.delete('q');
            setSearchParam(searchParams);
        }

        setSearchText(value)

    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);

        if (searchText.trim().length === 0) {
            params.delete('q');
        } else {
            params.set('q', searchText);
        }

        setSearchParam(params);
    }

    useEffect(() => {
        if (!showNotifications) {
            return;
        }

        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    return (
        <div className='w-full h-screen bg-main flex'>
            <Sidebar />
            
            <div className='flex-1 p-2 bg-main-white overflow-y-auto'>
                <div className='flex-1 flex flex-col p-6 gap-8  rounded-md bg-main shadow-md'>
                    <div className='flex justify-between'>
                        <form className='basis-1/2 flex items-center gap-2' onSubmit={handleSearch}>
                            {
                                !hideSearchbar && <>
                                    <Searchbar onChange={(value) => handleSetSearchText(value)} />
                                    {searchText.trim().length > 0 &&
                                        <Button icon={Search} text='' variant='icon' className='rounded-2xl' onClick={handleSearch} />
                                    }
                                </>
                            }
                        </form>

                        <div className='flex gap-2'>
                            {isAdmin && (
                                <div ref={notificationRef} className='relative'>
                                    <button
                                        onClick={() => setShowNotifications(prev => !prev)}
                                        className='relative w-10 h-10 rounded-full bg-main-white border border-border flex items-center justify-center hover:bg-main/70'
                                    >
                                        <Bell size={18} className='text-text/80' />
                                        {totalNotificationCount > 0 && (
                                            <span className='absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-error text-main-white text-[10px] font-bold flex items-center justify-center'>
                                                {totalNotificationCount > 99 ? '99+' : totalNotificationCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className='absolute right-0 mt-2 w-80 bg-main-white border border-border rounded-lg shadow-lg z-30'>
                                            <div className='px-4 py-3 border-b border-border'>
                                                <h5 className='font-semibold text-text'>Notifications</h5>
                                            </div>

                                            <div className='p-2 flex flex-col gap-1'>
                                                {notifications.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            setShowNotifications(false);
                                                            item.onClick();
                                                        }}
                                                        className='w-full text-left px-3 py-2 rounded-md hover:bg-main/70 border border-transparent hover:border-border transition'
                                                    >
                                                        <div className='flex items-center justify-between'>
                                                            <h5 className='text-sm font-semibold text-text'>{item.label}</h5>
                                                            {item.count > 0 && (
                                                                <span className='text-xs font-bold text-error'>{item.count}</span>
                                                            )}
                                                        </div>
                                                        <h5 className='text-xs text-text/60 mt-0.5'>{item.details}</h5>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <ProfileCard user={user} />
                        </div>
                    </div>

                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout