import { AuthContext } from '@/context/AuthContext';
import { SidebarConfig } from '@/config/SidebarConfig';
import { Navigate, useLocation } from 'react-router-dom';
import { Hourglass } from 'lucide-react';
import React, {useContext} from 'react';

const ProtectedRoute = ({children}) => {
    const {loading, isAuthorized, user} = useContext(AuthContext);
    const location = useLocation();

    const role = user?.is_staff ? 'admin' : (Array.isArray(user?.groups) ? user.groups[0] : null);

    const isAllowedPathForRole = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }

        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const isCashierPathAllowed = SidebarConfig.some(({ link, allowedRoles }) =>
        allowedRoles.includes('cashier') && isAllowedPathForRole(link)
    );

    if (loading) {
        return <div className="w-screen h-screen flex flex-col justify-center items-center text-text/50">
                    <Hourglass className='animate-spin-delay'/>
                    <h5>Please wait for a bit</h5>
                </div>
    }

    if (isAuthorized && role === 'cashier' && !isCashierPathAllowed) {
        return <Navigate to='/404' replace />;
    }

    return isAuthorized ? children : <Navigate to='/login' />
}

export default ProtectedRoute;