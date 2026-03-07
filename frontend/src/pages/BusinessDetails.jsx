import { Title, Label, Button } from '@/components/atoms';
import Loading from '@/components/molecules/Loading';
import useBusinessDetails from '@/hooks/useBusinessDetails';
import React, { useState, useEffect, useContext } from 'react';
import { useToast } from '@/context/ToastContext';
import { ConfirmationModal } from '@/components/organisms';
import { Eye, EyeClosed } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import api from '@/api/api';
import { BusinessDetailsSkeleton } from '@/components/molecules/Skeletons';


const BusinessDetails = () => {

    const { user, getUserData } = useContext(AuthContext)

    // BUSINESS DETAILS LOGIC
    const {data, loading, error, patchBusinessDetails} = useBusinessDetails();
    const [businessName, setBusinessName] = useState("");
    const [address, setAddress] = useState("");
    const [tin, setTin] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [message, setMessage] = useState("");
    const [secretPIN, setSecretPIN] = useState('');

    // ADMIN LOGIC
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (data) {
            setBusinessName(data.business_name || "");
            setAddress(data.address || "");
            setTin(data.tin || "");
            setContactNumber(data.contact_number || "");
            setMessage(data.message || "");
            setSecretPIN(data.secret_pin || "")
        }

        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setEmail(user.email || "");
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
            message,
            secret_pin: secretPIN
        };

        try {
            await patchBusinessDetails(1, payload);

            addToast("Business details changed successfully")
            toggleConfirmationModal();
        } catch (err) {
            addToast("Failed to edit business details")
        }
    }

    const updateAccountDetails = async () => {
        const payload = {
            first_name: firstName,
            last_name: lastName,
            email
        }

        try {
            await api.patch('/users/update-me/', payload);
            getUserData();

            addToast("Admin Account has been updated!");
        } catch (err) {
            addToast("Failed to update Admin Account", "error");
        }
    }

    // FEEDBACK LOGIC
    const { addToast } = useToast();

    // MODAL LOGIC
    
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const toggleConfirmationModal = () => setShowConfirmationModal(prev => !prev);

    // TOGGLE LOGIC

    const [showSecretPIN, setShowSecretPIN] = useState(false);
    const toggleShowSecretPIN = () => setShowSecretPIN(prev => !prev)

    // UI LOGIC

    if (loading) return <BusinessDetailsSkeleton />
    if (error) return <h5>Error: {error}</h5> 

    return (
    <div className='grid grid-cols-2 w-full h-full gap-4 mb-4'>
        {/* LEFT COLUMN */}
        <div className='flex flex-col gap-4'>
            {/* Business Details + Credentials combined */}
            <div className='p-8 rounded-lg bg-main-white shadow-sm'>
                <div className='flex items-center justify-between'>
                    <Title text='Business Details' variant='block' />
                    {(businessName != data?.business_name || address !== data?.address || tin != data.tin) &&
                        <Button text='Save' size='small' onClick={toggleConfirmationModal}/>
                    }
                </div>
                <div className='mt-4'>
                    <Label variant='small' text='Business Name' />
                    <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={businessName} onChange={handleBusinessName}/>
                </div>
                <div className='mt-4'>
                    <Label variant='small' text='Address' />
                    <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={address} onChange={handleAddress}/>
                </div>
                <div className='mt-4'>
                    <Label variant='small' text='TIN' />
                    <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={tin} onChange={handleTin}/>
                </div>
            </div>

            {/* Secret PIN */}
            <div className='p-8 rounded-lg bg-main-white shadow-sm'>
                <div className='flex items-center justify-between'>
                    <Title text='Secret PIN' variant='block' />
                    {secretPIN != data?.secret_pin &&
                        <Button text='Save' size='small' onClick={toggleConfirmationModal}/>
                    }
                </div>
                <div className='mt-4'>
                    <Label variant='small' text='POS PIN' />
                    <div className='flex gap-2 items-center justify-between'>
                        {showSecretPIN ?
                            <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-1/2' value={secretPIN} onChange={handleSecretPIN}/>
                            :
                            <input type='password' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-1/2' value={secretPIN} onChange={handleSecretPIN}/>
                        }
                        <button onClick={toggleShowSecretPIN}>
                            {showSecretPIN ? <EyeClosed /> : <Eye />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className='flex flex-col gap-4'>
            {/* Contact and Message */}
            <div className='p-8 rounded-lg bg-main-white shadow-sm'>
                <div className='flex items-center justify-between'>
                    <Title text='Contact and Message' variant='block' />
                    {(contactNumber != data?.contact_number || message != data?.message) &&
                        <Button text='Save' size='small' onClick={toggleConfirmationModal}/>
                    }
                </div>
                <div className='mt-4'>
                    <Label variant='small' text='Contact Number' />
                    <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={contactNumber} onChange={handleContactNumber}/>
                </div>
                <div className='mt-4'>
                    <Label variant='small' text='Message' />
                    <textarea className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full resize-none' rows={3} value={message} onChange={handleMessage}/>
                </div>
            </div>

            {/* Personal Information */}
            <div className='p-8 rounded-lg bg-main-white shadow-sm'>
                <div className='flex items-center justify-between'>
                    <Title text='Personal Information' variant='block' />
                    {(firstName !== user?.first_name || lastName !== user?.last_name || email !== user?.email) && (
                        <Button text='Save Changes' size='small' onClick={updateAccountDetails} />
                    )}
                </div>
                <div className='flex gap-4 mt-4'>
                    <div className='flex-1'>
                        <Label variant='small' text='First Name' />
                        <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                    </div>
                    <div className='flex-1'>
                        <Label variant='small' text='Last Name' />
                        <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                    </div>
                </div>
                <div className='mt-4'>
                    <Label variant='small' text='Email Address' />
                    <input type='email' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
            </div>
        </div>

        {showConfirmationModal &&
            <ConfirmationModal title="Edit Business Details" content="Are you sure you want to change the business details?" onReject={toggleConfirmationModal} onConfirm={editBusinessDetails} />
        }
    </div>
)
}

export default BusinessDetails;