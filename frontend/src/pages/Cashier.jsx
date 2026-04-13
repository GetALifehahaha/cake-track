import React, { useState } from 'react';
import { Button, Dropdown, Title } from '../components/atoms';
import { AddCashierModal, EditCashierModal } from '../components/organisms';
import { Plus, Ellipsis, ChevronLeft, ChevronRight } from 'lucide-react';
import useCashier from '@/hooks/useCashier';
import Loading from '@/components/molecules/Loading';
import { Pagination } from '@/components/molecules';
import { useToast } from '@/context/ToastContext';
import clsx from 'clsx';
import { CashierSkeleton } from '@/components/molecules/Skeletons';
import { useSearchParams } from 'react-router-dom';
import { buildOrderingParam, parseOrderingParam, sortDirectionOptions } from '@/utils/sorting';

const cashierStatusOptions = [
    { key: 'Active', value: 'true' },
    { key: 'Inactive', value: 'false' },
];

const cashierSortOptions = [
    { key: 'Full Name', value: 'first_name,last_name' },
    { key: 'Username', value: 'username' },
    { key: 'Email', value: 'email' },
];

const Cashier = () => {

    const { addToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data, loading, refresh, postCashier, patchCashier } = useCashier();

    const [showAddCashierModal, setShowAddCashierModal] = useState(false);
    const [showEditCashierModal, setShowEditCashierModal] = useState(false);
    const [prepCashier, setPrepCashier] = useState(null)

    const selectedStatus = searchParams.get('is_active') || null;
    const { sortField: selectedSortField, sortDirection: selectedSortDirection } = parseOrderingParam(searchParams.get('ordering'));
    const hasActiveFilters = Boolean(selectedStatus || selectedSortField);

    if (loading) return <CashierSkeleton />

    const updateQueryParams = (updates) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                params.delete(key);
                return;
            }

            params.set(key, value);
        });

        params.set('page', '1');
        setSearchParams(params);
    };

    const clearFiltersAndSorting = () => {
        updateQueryParams({
            is_active: null,
            ordering: null,
        });
    };

    const handleShowAddCashierModal = () => {
        setShowAddCashierModal(!showAddCashierModal)
    }

    const handleShowEditCashierModal = () => {
        setShowEditCashierModal(!showEditCashierModal)
    }

    const addCashier = async (value) => {
        try {
            const response = await postCashier(value);

            if (response.status === 200 || response.status === 201) {
                addToast('Cashier registered successfully', 'success');
                refresh();
            }

            handleShowAddCashierModal();
        } catch (err) {
            const errorData = err.response?.data;

            const usernameError = errorData?.username?.[0] || errorData?.username;
            const emailError = errorData?.email?.[0] || errorData?.email;
            const generalError = errorData?.detail || "An unexpected error occurred";

            const errorMessage = usernameError || emailError || generalError;

            addToast(`Failed to register cashier: ${errorMessage}`, 'error');
        }
    };

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

    const handleDeleteCashiers = () => {
        handlePrepEditCashier(null);
        handleShowEditCashierModal();
    }

    const listCashiers = data?.results ? data.results.map((cashier, index) =>
        <div key={index}
            className={clsx('p-2 flex flex-row cashiers-center text-text font-medium text-md text-center border-b-border border-b',
                { 'opacity-50': !cashier.is_active })}>
            <h5 className='flex-1'>{cashier.first_name} {cashier.last_name}</h5>
            {/* <h5 className='flex-1'>{cashier.contactNumber}</h5> */}
            {/* <h5 className='flex-1'>{cashier.address}</h5> */}
            <h5 className='flex-1'>{cashier.username}</h5>
            <h5 className='flex-1'>{cashier.email}</h5>
            <h5 className='flex-1'><Ellipsis size={18} className='mx-auto cursor-pointer' onClick={() => handlePrepEditCashier(cashier)} /></h5>
        </div>
    ) : <p>No cashiers found.</p>;

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col'>
                <Title text='Cashiers' />
            <div className='border-accent-mute border rounded-lg p-4'>
                {/* Header */}
                <div className="flex flex-row justify-between items-center">

                    <div className='flex flex-row items-end gap-2 w-full mb-4'>
                        <div className='w-36'>
                            <h5 className='text-xs font-semibold text-text/50 mb-1'>Status</h5>
                            <Dropdown
                                size='full'
                                variant='white'
                                selection='Any status'
                                value={selectedStatus}
                                options={cashierStatusOptions}
                                onSelect={(value) => updateQueryParams({ is_active: value })}
                            />
                        </div>

                        <div className='w-56'>
                            <h5 className='text-xs font-semibold text-text/50 mb-1'>Sort By</h5>
                            <Dropdown
                                size='full'
                                variant='white'
                                selection='Default'
                                value={selectedSortField}
                                options={cashierSortOptions}
                                onSelect={(value) => updateQueryParams({ ordering: buildOrderingParam(value, selectedSortDirection) })}
                            />
                        </div>

                        {selectedSortField && (
                            <div className='w-44'>
                                <h5 className='text-xs font-semibold text-text/50 mb-1'>Direction</h5>
                                <Dropdown
                                    size='full'
                                    variant='white'
                                    selection='Ascending'
                                    value={selectedSortDirection}
                                    options={sortDirectionOptions}
                                    onSelect={(value) => updateQueryParams({ ordering: buildOrderingParam(selectedSortField, value) })}
                                />
                            </div>
                        )}

                        {hasActiveFilters && (
                            <Button
                                variant='modalOutline'
                                size='small'
                                text='Clear All'
                                onClick={clearFiltersAndSorting}
                            />
                        )}

                        <Button variant='block' size='small' text='Add Cashier' icon={Plus} onClick={handleShowAddCashierModal} className='ml-auto' />
                    </div>
                </div>

                {/* Table */}
                <div className='mt-2 flex flex-col min-h-100'>
                    <div className='p-2 bg-accent-mute rounded-lg flex flex-row items-center text-white text-sm text-center'>
                        <h5 className='flex-1'>Full Name</h5>
                        {/* <h5 className='basis-1/5'>Contact Number</h5>
                        <h5 className='basis-1/5'>Address</h5> */}
                        <h5 className='flex-1'>Username</h5>
                        <h5 className='flex-1'>Email Address</h5>
                        <h5 className='flex-1'>Action</h5>
                    </div>

                    {listCashiers}

                </div>
                <Pagination prev={data.previous} next={data.next} count={data?.count} />
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