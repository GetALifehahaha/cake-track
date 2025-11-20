import { AuthContext } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Hourglass } from 'lucide-react';
import React, {useContext} from 'react';

const ProtectedRoute = ({children}) => {
    const {loading, isAuthorized} = useContext(AuthContext);

    if (loading) {
        return <div className="w-screen h-screen flex flex-col justify-center items-center text-text/50">
                    <Hourglass className='animate-spin-delay'/>
                    <h5>Please wait for a bit</h5>
                </div>
    }

    return isAuthorized ? children : <Navigate to='/login' />
}

export default ProtectedRoute;