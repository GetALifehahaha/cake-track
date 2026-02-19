import { Title, Label, Button } from '@/components/atoms';
import Loading from '@/components/molecules/Loading';
import useBusinessDetails from '@/hooks/useBusinessDetails';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { ConfirmationModal } from '@/components/organisms';

const BusinessDetails = () => {

    // BUSINESS DETAILS LOGIC
    const {data, loading, error, patchBusinessDetails} = useBusinessDetails();
    const [businessName, setBusinessName] = useState("");
    const [address, setAddress] = useState("");
    const [tin, setTin] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [message, setMessage] = useState("");
    const [secretPIN, setSecretPIN] = useState()

    useEffect(() => {
        if (data) {
            setBusinessName(data.business_name || "");
            setAddress(data.address || "");
            setTin(data.tin || "");
            setContactNumber(data.contact_number || "");
            setMessage(data.message || "");
            setSecretPIN(data.secret_pin || "")
        }
    }, [data]);

    const createChangeHandler = (setState, options = {}) => {
        const { maxLength = 50, isNumber = false } = options;

        return (e) => {
            const value = e.target.value;

            if (value.length > maxLength) return;

            if (isNumber && !/^\d*$/.test(value)) return;

            setState(value);
        };
    };
    
    const handleBusinessName = createChangeHandler(setBusinessName)
    const handleAddress = createChangeHandler(setAddress)
    const handleTin = createChangeHandler(setTin, {maxLength: 12, isNumber: true});
    const handleContactNumber = createChangeHandler(setContactNumber, {maxLength: 12, isNumber: true});
    const handleMessage = createChangeHandler(setMessage, {maxLength: 255})
    const handleSecretPIN = createChangeHandler(setSecretPIN, {maxLength: 4, isNumber: true})

    const editBusinessDetails = async () => {
        const payload = {
            business_name: businessName,
            address,
            tin,
            contact_number: contactNumber,
            message
        };

        try {
            const response = await patchBusinessDetails(1, payload);

            addToast("Business details changed successfully")
            toggleConfirmationModal();
        } catch (err) {
            addToast("Failed to edit business details")
        }
    }

    // FEEDBACK LOGIC
    const { addToast } = useToast();

    // MODAL LOGIC
    
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const toggleConfirmationModal = () => setShowConfirmationModal(prev => !prev);

    // UI LOGIC

    if (loading) return <Loading />
    if (error) return <h5>Error: {error}</h5> 

    return (
        <div className='flex flex-row w-full h-full gap-8 mb-4'>
            <div className='flex-1 flex flex-col gap-6'> 
                <div className='p-6 rounded-sm bg-main-white shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <Title text='Business Details' variant='block' />
                        <Button text='Save' size='small' onClick={toggleConfirmationModal}/>
                    </div>

                    <div className='mt-4'>
                        <Label variant='small' text='Business Name' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={businessName} onChange={handleBusinessName}/>
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='Address' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={address} onChange={handleAddress}/>
                    </div>
                </div>

                <div className='p-6 rounded-sm bg-main-white shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <Title text='Business Credentials' variant='block' />
                        <Button text='Save' size='small' onClick={toggleConfirmationModal}/>
                    </div>

                    <div className='mt-4'>
                        <Label variant='small' text='TIN' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={tin} onChange={handleTin}/>
                    </div>
                </div>

                <div className='p-6 rounded-sm bg-main-white shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <Title text='Contact and Message' variant='block' />
                        <Button text='Save' size='small' onClick={toggleConfirmationModal}/>
                    </div>

                    <div className='mt-4'>
                        <Label variant='small' text='Contact Number' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={contactNumber} onChange={handleContactNumber}/>
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='Message' />
                        <input type='text' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={message} onChange={handleMessage}/>
                    </div>
                </div>

                <div className='p-6 rounded-sm bg-main-white shadow-sm w-fit'>
                    <div className='flex items-center justify-between'>
                        <Title text='Secret PIN' variant='block' />
                        <Button text='Save' size='small' onClick={toggleConfirmationModal}/>
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='POS PIN' />
                        <input type='password' className='mt-1 px-4 py-1 border border-border rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={secretPIN} onChange={handleSecretPIN}/>
                    </div>
                </div>
            </div>

            {showConfirmationModal &&
                <ConfirmationModal title="Edit Business Details" content="Are you sure you want to verify the business details?" onReject={toggleConfirmationModal} onConfirm={editBusinessDetails} />
            }
        </div>
    )
}

export default BusinessDetails;