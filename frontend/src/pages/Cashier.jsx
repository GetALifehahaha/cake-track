import React, { useState } from 'react';
import { Button, Title } from '../components/atoms';
import { AddCashierModal, EditCashierModal } from '../components/organisms';
import { Plus, Ellipsis, ChevronLeft, ChevronRight } from 'lucide-react';
import useCashier from '@/hooks/useCashier';
import Loading from '@/components/molecules/Loading';
import { Pagination } from '@/components/molecules';
import { useToast } from '@/context/ToastContext';
import clsx from 'clsx';

const Cashier = () => {

    const { addToast } = useToast();
    const { data, loading, error, refresh, postCashier, patchCashier } = useCashier();

    const [showAddCashierModal, setShowAddCashierModal] = useState(false);
    const [showEditCashierModal, setShowEditCashierModal] = useState(false);
    const [prepCashier, setPrepCashier] = useState(null)

    if (loading) return <Loading />
    if (error) return <h5>Error</h5>

    const handleShowAddCashierModal = () => {
        setShowAddCashierModal(!showAddCashierModal)
    }

    const handleShowEditCashierModal = () => {
        setShowEditCashierModal(!showEditCashierModal)
    }

    const addCashier = async (value) => {
        try {
            await postCashier(value);
            addToast('Cashier registered successfully', 'success');
            refresh();
        } catch (err) {
            addToast('Failed to register cashier', 'error');
            console.log(err);
        } finally {
            handleShowAddCashierModal();
        }
    }

    const handlePrepEditCashier = (value) => {
        setPrepCashier(value);
        handleShowEditCashierModal();
    }

    const editCashier = async (value) => {
        try {
            await patchCashier(prepCashier.id, value);
            addToast('Cashier updated successfully', 'success');
            refresh();
        } catch (err) {
            addToast('Failed to update cashier', 'error');
            console.log(err);
        } finally {
            handlePrepEditCashier(null);
            handleShowEditCashierModal();
        }
    }

    const handleDeleteCashiers = (id) => {
        handlePrepEditCashier(null);
        handleShowEditCashierModal();
    }

    const listCashiers = data.results.map((cashier, index) =>
        <div key={index} 
            className={clsx('p-2 flex flex-row cashiers-center text-text font-medium text-md text-center border-b-border border-b', 
            {'opacity-50': !cashier.is_active})}>
            <h5 className='flex-1'>{cashier.first_name} {cashier.last_name}</h5>
            {/* <h5 className='flex-1'>{cashier.contactNumber}</h5> */}
            {/* <h5 className='flex-1'>{cashier.address}</h5> */}
            <h5 className='flex-1'>{cashier.username}</h5>
            <h5 className='flex-1'>{cashier.email}</h5>
            <h5 className='flex-1'><Ellipsis size={18} className='mx-auto cursor-pointer' onClick={() => handlePrepEditCashier(cashier)} /></h5>
        </div>
    )

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col'>
            <div className='border-accent-mute border rounded-lg p-4'>
                {/* Header */}
                <div className="flex flex-row justify-between items-center">
                    <Title variant='block' text='Cashiers' />

                    <div className='flex flex-row items-center gap-2'>
                        <Button variant='block' size='small' text='Add Cashier' icon={Plus} onClick={handleShowAddCashierModal} />
                    </div>
                </div>

                {/* Table */}
                <div className='mt-2 flex flex-col min-h-120'>
                    <div className='p-2 bg-accent-mute rounded-lg flex flex-row items-center text-white text-sm text-center'>
                        <h5 className='flex-1'>Full Name</h5>
                        {/* <h5 className='basis-1/5'>Contact Number</h5>
                        <h5 className='basis-1/5'>Address</h5> */}
                        <h5 className='flex-1'>Username</h5>
                        <h5 className='flex-1'>Email Address</h5>
                        <h5 className='flex-1'>Action</h5>
                    </div>

                    {listCashiers}
                    
                    <div className='mt-auto mx-auto'>
                        <Pagination prev={data.previous} next={data.next} />
                    </div>
                </div>
            </div>

            {/* Modals */}

            {showAddCashierModal &&
                <AddCashierModal onConfirm={addCashier} onClose={handleShowAddCashierModal} />
            }

            {showEditCashierModal &&
                <EditCashierModal cashier={prepCashier} onDelete={handleDeleteCashiers} onConfirm={editCashier} onClose={handleShowEditCashierModal} />
            }
        </div>
    )
}

export default Cashier;