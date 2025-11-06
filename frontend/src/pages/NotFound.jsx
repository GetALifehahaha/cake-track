import React from 'react';
import { CakeSlice } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms';

const NotFound = () => {

    const navigate = useNavigate();

    const handleGoToBack = () => navigate(-1);

    return (
        <div className='h-screen w-full flex flex-col gap-2 justify-center items-center'>
            <CakeSlice className=' text-text/50 animate-bounce' size={48} />
            <h5 className='text-text font-bold text-4xl'>404</h5>
            <p className='text-text/75 text-2xl font-medium mb-8'>Page Not Found</p>

            <Button variant='outline' text='Go Back' onClick={handleGoToBack}/>
        </div>
    )
}

export default NotFound;