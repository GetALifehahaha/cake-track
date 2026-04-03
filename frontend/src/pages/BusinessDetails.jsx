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
import { limitedInput } from '@/utils/safeInput';


const BusinessDetails = () => {

    const { user, getUserData } = useContext(AuthContext)

    // BUSINESS DETAILS LOGIC
    const { data, loading, error, patchBusinessDetails } = useBusinessDetails();
    const [businessName, setBusinessName] = useState("");
    const [address, setAddress] = useState("");
    const [tin, setTin] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [message, setMessage] = useState("");
    const [gcashOwnerName, setGcashOwnerName] = useState("");
    const [gcashOwnerNumber, setGcashOwnerNumber] = useState("");
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
            setGcashOwnerName(data.gcash_owner_name || "");
            setGcashOwnerNumber(data.gcash_owner_number || "");
            setSecretPIN(data.secret_pin || "")
        }

        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setEmail(user.email || "");
        }
    }, [data]);

    const createChangeHandler = (setState, options = {}) => {
        return (e) => {
            const value = limitedInput(e, options);
            if (value === undefined) return;
            setState(value);
        };
    };

    const handleBusinessName = createChangeHandler(setBusinessName)
    const handleAddress = createChangeHandler(setAddress)
    const handleTin = createChangeHandler(setTin, { maxLength: 12, isNumber: true });
    const handleContactNumber = createChangeHandler(setContactNumber, { maxLength: 12, isNumber: true });
    const handleMessage = createChangeHandler(setMessage, { maxLength: 255 })
    const handleSecretPIN = createChangeHandler(setSecretPIN, { maxLength: 4, isNumber: true })

    const formatGCashNumber = (value) => {
        const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 4) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    };

    const maskGCashOwnerName = (fullName) => {
        const normalized = String(fullName || '').trim().replace(/\s+/g, ' ');
        if (!normalized) return '';

        const nameParts = normalized.split(' ');
        const firstName = (nameParts[0] || '').toUpperCase();
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        if (!firstName) return '';

        let maskedFirstName = firstName;
        if (firstName.length > 2) {
            maskedFirstName = `${firstName.slice(0, 2)}${'*'.repeat(Math.max(0, firstName.length - 3))}${firstName.slice(-1)}`;
        }

        const lastInitial = lastName ? ` ${lastName[0].toUpperCase()}.` : '';
        return `${maskedFirstName}${lastInitial}`;
    };

    const handleGcashOwnerName = createChangeHandler(setGcashOwnerName, { maxLength: 100 });
    const handleGcashOwnerNumber = (e) => {
        setGcashOwnerNumber(formatGCashNumber(e.target.value));
    };

    const editBusinessDetails = async () => {
        const payload = {
            business_name: businessName,
            address,
            tin,
            contact_number: contactNumber,
            message,
            gcash_owner_name: gcashOwnerName,
            gcash_owner_number: gcashOwnerNumber,
        };

        if (String(secretPIN || '').trim().length > 0) {
            payload.secret_pin = secretPIN;
        }

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
                            <Button text='Save' size='small' onClick={toggleConfirmationModal} />
                        }
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='Business Name' />
                        <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={businessName} onChange={handleBusinessName} />
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='Address' />
                        <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={address} onChange={handleAddress} />
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='TIN' />
                        <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={tin} onChange={handleTin} />
                    </div>
                </div>

                <div className='p-8 rounded-lg bg-main-white shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <Title text='Contact and Message' variant='block' />
                        {(contactNumber != data?.contact_number || message != data?.message) &&
                            <Button text='Save' size='small' onClick={toggleConfirmationModal} />
                        }
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='Contact Number' />
                        <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={contactNumber} onChange={handleContactNumber} />
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='Message' />
                        <textarea className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full resize-none' rows={3} value={message} onChange={handleMessage} />
                    </div>
                </div>

                {/* Secret PIN */}
                <div className='p-8 rounded-lg bg-main-white shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <Title text='Secret PIN' variant='block' />
                        {secretPIN != data?.secret_pin &&
                            <Button text='Save' size='small' onClick={toggleConfirmationModal} />
                        }
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='POS PIN' />
                        <div className='flex gap-2 items-center justify-between'>
                            {showSecretPIN ?
                                <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-1/2' value={secretPIN} onChange={handleSecretPIN} />
                                :
                                <input type='password' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-1/2' value={secretPIN} onChange={handleSecretPIN} />
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
                            <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className='flex-1'>
                            <Label variant='small' text='Last Name' />
                            <input type='text' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='Email Address' />
                        <input type='email' className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>

                <div className='p-8 rounded-lg bg-main-white shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <Title text='GCash Information' variant='block' />
                        {(gcashOwnerName !== data?.gcash_owner_name || gcashOwnerNumber !== data?.gcash_owner_number) &&
                            <Button text='Save' size='small' onClick={toggleConfirmationModal} />
                        }
                    </div>

                    <div className='mt-4'>
                        <Label variant='small' text='Owner Full Name' />
                        <input
                            type='text'
                            className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full'
                            value={gcashOwnerName}
                            onChange={handleGcashOwnerName}
                        />
                    </div>
                    <div className='mt-4'>
                        <Label variant='small' text='GCash Number' />
                        <input
                            type='text'
                            className='mt-1 px-4 py-2 rounded-md text-sm bg-main-dark/50 focus:outline-none w-full'
                            value={gcashOwnerNumber}
                            onChange={handleGcashOwnerNumber}
                        />
                    </div>

                    <div className='mt-5 rounded-xl border border-[#e7d8c6] bg-linear-to-br from-[#fffaf4] to-[#f4e8da] p-5'>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ab8764]'>Live Preview</p>
                        <div className='mt-3 rounded-lg border border-[#eadfce] bg-white/90 p-4 shadow-sm'>
                            <p className='text-xs text-[#ab8764]'>Account Name</p>
                            <p className='mt-1 text-base font-bold tracking-wide text-[#5d3a1f]'>
                                {maskGCashOwnerName(gcashOwnerName) || '-'}
                            </p>

                            <div className='my-3 h-px bg-[#eadfce]' />

                            <p className='text-xs text-[#ab8764]'>GCash Number</p>
                            <p className='mt-1 text-base font-semibold tracking-[0.12em] text-[#7a4520]'>
                                {formatGCashNumber(gcashOwnerNumber) || '-'}
                            </p>
                        </div>
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