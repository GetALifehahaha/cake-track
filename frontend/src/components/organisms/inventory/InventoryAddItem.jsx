import React, { useEffect, useState } from 'react';
import { Title, Label, Button, Dropdown } from '../../atoms';
import { DatePicker, ModalBody, ModalFeedbackCard, ModalErrorState } from '../../molecules';
import { X, Plus, Check } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';
import useUnits from '@/hooks/useUnits';
import { AddInventoryItemSkeleton } from '@/components/molecules/Skeletons';
import { formatQty } from '@/utils/formatQty';
import { limitedInput } from '@/utils/safeInput';
import UnitModal from './UnitModal';

const InventoryAddItem = ({ onConfirm, onClose }) => {

    const { data: units, loading, error, refresh } = useUnits()
    const [name, setName] = useState("");
    const [amount, setAmount] = useState(0);
    const [lowAmount, setLowAmount] = useState('0');
    const [unit, setUnit] = useState(null);
    const [containers, setContainers] = useState([]);
    const [purchaseDate, setPurchaseDate] = useState();
    const [expirationDate, setExpirationDate] = useState();
    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);

    useEffect(() => {
        if (modalFeedbackContent) {
            setShowModalFeedback(true);
        } else {
            setModalFeedbackContent(false);
        }
    }, [modalFeedbackContent])

    if (loading) return <AddInventoryItemSkeleton onClose={onClose} />
    if (error) return <ModalErrorState onClose={onClose} onRetry={refresh} title='Failed to load units' details='Unable to fetch units for inventory item creation.' />

    const unitSelection = units.map(unit => ({
        key: `${unit.name}${unit.abbreviation ? ` (${unit.abbreviation})` : ''}`, value: unit.id
    }))

    const selectedUnitMeta = units.find(u => u.id === unit);
    const compatibleUnits = units
        .filter(u => u.id !== unit)
        .map(u => ({ key: `${u.name}${u.abbreviation ? ` (${u.abbreviation})` : ''}`, value: u.id }));

    const handleConfirm = () => {
        const parsedAmount = Number(amount || 0);

        const normalizedContainers = containers
            .filter(item => item.container_unit_id && Number(item.container_amount) > 0)
            .map(item => ({
                container_unit_id: item.container_unit_id,
                container_amount: item.container_amount,
            }));

        onConfirm({
            name,
            amount: parsedAmount,
            total_stock: parsedAmount,
            low_amount: Number(lowAmount || 0),
            unit_id: unit,
            purchaseDate: purchaseDate.toLocaleDateString("en-CA"),
            expirationDate: expirationDate.toLocaleDateString("en-CA"),
            containers: normalizedContainers,
        });
    }

    const handleName = (e) => {
        const value = limitedInput(e, { maxLength: 50 });
        if (value === undefined) return;
        setName(value);
    }

    const handleAmount = (e) => {
        e.preventDefault();

        const raw = e.target.value

        if (!/^\d*\.?\d{0,2}$/.test(raw)) return

        if (e.target.value.length > 11) return;

        setAmount(e.target.value);
    }

    const handleAmountBlur = () => {
        if (amount === '') return;
        setAmount(formatQty(amount));
    }

    const handleSetUnit = (value) => {
        setUnit(value)
    }

    const handleLowAmount = (e) => {
        const value = limitedInput(e, { maxLength: 9, isNumber: true });
        if (value === undefined) return;
        setLowAmount(value);
    }

    const openUnitModal = () => {
        setShowUnitModal(true);
    };

    const closeUnitModal = async () => {
        setShowUnitModal(false);
        await refresh();
    };

    const addContainerRow = () => {
        setContainers(prev => [...prev, { container_unit_id: null, container_amount: '' }]);
    };

    const removeContainerRow = (index) => {
        setContainers(prev => prev.filter((_, idx) => idx !== index));
    };

    const updateContainerRow = (index, key, value) => {
        setContainers(prev => prev.map((row, idx) => idx === index ? { ...row, [key]: value } : row));
    };

    const normalizeContainerRow = (index) => {
        setContainers(prev => prev.map((row, idx) => {
            if (idx !== index || row.container_amount === '') return row;
            return { ...row, container_amount: formatQty(row.container_amount) };
        }));
    };

    const handleSetShowConfirm = () => {
        if (!name || !amount || lowAmount === '' || !unit || !purchaseDate || !expirationDate) {
            setModalFeedbackContent({ type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.` })
            return;
        }

        if (expirationDate <= purchaseDate) {
            setModalFeedbackContent({ type: "error", label: "Invalid Expiration Date", details: 'Expiry date must be later than the purchase date.' })
            return;
        }
        setShowConfirm(true)
    };

    const handleSetCloseConfirm = () => setShowConfirm(false);

    return (
        <ModalBody title='Add New Item' onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <Label variant='modal' text='Name' />
                    <input type='text' placeholder='Enter item name' value={name} onChange={(e) => handleName(e)}
                        className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' />
                </div>

                <div className='flex items-center gap-4'>
                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Amount' />
                        <input type='text' placeholder='Enter amount' value={amount} onChange={(e) => handleAmount(e)} onBlur={handleAmountBlur}
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' />
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Low Stock Threshold' />
                        <input
                            type='text'
                            placeholder='Enter low stock threshold'
                            value={lowAmount}
                            onChange={handleLowAmount}
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                        />
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Unit' />
                        <div className='flex gap-2 items-center'>
                            <Dropdown size='full' variant='modal' value={unit} selection="e.g., Kilograms" options={unitSelection} onSelect={handleSetUnit} />
                            <Button variant='icon' text='' icon={Plus} onClick={openUnitModal} />
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                        <Label variant='modal' text='Container Mappings (Optional)' />
                        <Button variant='modalOutline' size='small' text='Add Container' onClick={addContainerRow} />
                    </div>

                    {containers.length === 0 && (
                        <h5 className='text-xs text-text/60'>Example: Flour base unit = kg, then set container cup → 0.2 (1 cup = 0.2 kg).</h5>
                    )}

                    <div className='flex flex-col gap-2'>
                        {containers.map((row, index) => (
                            <div key={index} className='flex gap-2 items-center'>
                                <div className='flex-1'>
                                    <Dropdown
                                        size='full'
                                        variant='modal'
                                        value={row.container_unit_id}
                                        selection='Container unit'
                                        options={compatibleUnits}
                                        onSelect={(value) => updateContainerRow(index, 'container_unit_id', value)}
                                    />
                                </div>
                                <input
                                    type='text'
                                    value={row.container_amount}
                                    placeholder={`1 unit = ? ${selectedUnitMeta?.abbreviation || selectedUnitMeta?.name || 'base'}`}
                                    className='w-56 px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none'
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (!/^\d*\.?\d{0,6}$/.test(raw)) return;
                                        updateContainerRow(index, 'container_amount', raw);
                                    }}
                                    onBlur={() => normalizeContainerRow(index)}
                                />
                                <Button variant='icon' text='' icon={X} onClick={() => removeContainerRow(index)} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className='flex-1 flex flex-col gap-2'>
                    <Label variant='modal' text='Purchase Date' />
                    <DatePicker selected={purchaseDate} onSelect={setPurchaseDate} />
                </div>

                <div className='flex-1 flex flex-col gap-2'>
                    <Label variant='modal' text='Expiration Date' />
                    <DatePicker
                        selected={expirationDate}
                        onSelect={setExpirationDate}
                        disabled={(date) => purchaseDate ? date <= purchaseDate : false}
                    />
                </div>

                {showModalFeedback &&
                    <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                }

                <div className='flex gap-4 mt-4 ml-auto'>
                    <Button variant='modalOutline' size='modalSize' text='Cancel' onClick={onClose} />
                    <Button variant='modalBlock' size='modalSize' text='Add Item' onClick={handleSetShowConfirm} />
                </div>
            </div>

            {showConfirm &&
                <ConfirmationModal title={"Add Item?"} content={"Are you sure you want to add this item?"} onReject={handleSetCloseConfirm} onConfirm={handleConfirm} />
            }

            {showUnitModal &&
                <UnitModal onClose={closeUnitModal} />
            }
        </ModalBody>
    )
}

export default InventoryAddItem;