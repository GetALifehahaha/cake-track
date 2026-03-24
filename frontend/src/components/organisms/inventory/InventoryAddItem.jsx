import React, { useEffect, useState } from 'react';
import { Title, Label, Button, Dropdown } from '../../atoms';
import { DatePicker, ModalBody, ModalFeedbackCard, ModalErrorState } from '../../molecules';
import { X, Plus, Check } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';
import useUnits from '@/hooks/useUnits';
import { AddInventoryItemSkeleton } from '@/components/molecules/Skeletons';
import { formatQty } from '@/utils/formatQty';

const InventoryAddItem = ({onConfirm, onClose}) => {

    const {data: units, loading, error, postUnit, refresh} = useUnits()
    const [name, setName] = useState("");
    const [amount, setAmount] = useState(0);
    const [unit, setUnit] = useState(null);
    const [creatingUnit, setCreatingUnit] = useState(false);
    const [newUnitName, setNewUnitName] = useState('');
    const [newUnitAbbreviation, setNewUnitAbbreviation] = useState('');
    const [conversions, setConversions] = useState([]);
    const [purchaseDate, setPurchaseDate] = useState();
    const [expirationDate, setExpirationDate] = useState();
    const [purchasePrice, setPurchasePrice] = useState('');
    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
        const normalizedConversions = conversions
            .filter(item => item.from_unit_id && Number(item.multiplier_to_base) > 0)
            .map(item => ({
                from_unit_id: item.from_unit_id,
                multiplier_to_base: item.multiplier_to_base,
            }));

        onConfirm({
            name,
            amount,
            unit_id: unit,
            purchaseDate: purchaseDate.toLocaleDateString("en-CA"),
            expirationDate: expirationDate.toLocaleDateString("en-CA"),
            purchasePrice,
            conversions: normalizedConversions,
        });
    }

    const handleName = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return;

        setName(e.target.value);
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

    const handleCreateUnit = async () => {
        if (!newUnitName.trim()) {
            setModalFeedbackContent({type: "error", label: "Incomplete Fields", details: `Unit name is required.`});
            return;
        }

        try {
            const created = await postUnit({
                name: newUnitName.trim(),
                abbreviation: newUnitAbbreviation.trim(),
            });

            await refresh();
            const newId = created?.data?.id || created?.id;
            if (newId) {
                setUnit(newId);
            }

            setCreatingUnit(false);
            setNewUnitName('');
            setNewUnitAbbreviation('');
        } catch (err) {
            const details = err?.response?.data?.name?.[0] || err?.response?.data?.detail || 'Failed to create unit.';
            setModalFeedbackContent({type: "error", label: "Create Unit Failed", details});
        }
    }

    const addConversionRow = () => {
        setConversions(prev => [...prev, { from_unit_id: null, multiplier_to_base: '' }]);
    };

    const removeConversionRow = (index) => {
        setConversions(prev => prev.filter((_, idx) => idx !== index));
    };

    const updateConversionRow = (index, key, value) => {
        setConversions(prev => prev.map((row, idx) => idx === index ? { ...row, [key]: value } : row));
    };

    const normalizeConversionRow = (index) => {
        setConversions(prev => prev.map((row, idx) => {
            if (idx !== index || row.multiplier_to_base === '') return row;
            return { ...row, multiplier_to_base: formatQty(row.multiplier_to_base) };
        }));
    };

    const handleSetShowConfirm = () => {
        if (!name || !amount || !unit || !purchaseDate || !expirationDate || !purchasePrice) {
            setModalFeedbackContent({type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.`})
            return;
        }

        if (Number.parseFloat(purchasePrice) <= 0) {
            setModalFeedbackContent({type: "error", label: "Invalid Purchase Price", details: 'Purchase price must be greater than zero.'})
            return;
        }
        
        if (expirationDate < purchaseDate) {
            setModalFeedbackContent({type: "error", label: "Invalid Expiration Date", details: 'Expiry date cannot be earlier than the purchase date.'})
            return;
        }
        setShowConfirm(true)
    };
    
    const handleSetCloseConfirm = () => setShowConfirm(false);

    return (
        <ModalBody title='Add New Item' onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <Label variant='modal' text='Name'/>
                    <input type='text' placeholder='Enter item name' value={name} onChange={(e) => handleName(e)} 
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'/>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Amount'/>
                        <input type='text' placeholder='Enter amount' value={amount} onChange={(e) => handleAmount(e)} onBlur={handleAmountBlur}
                                className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'/>
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Unit'/>
                        {creatingUnit ? (
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    value={newUnitName}
                                    placeholder='Unit name (e.g., Kilogram)'
                                    className='flex-1 px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none'
                                    onChange={(e) => e.target.value.length <= 20 && setNewUnitName(e.target.value)}
                                />
                                <input
                                    type='text'
                                    value={newUnitAbbreviation}
                                    placeholder='Abbr (e.g., kg)'
                                    className='w-28 px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none'
                                    onChange={(e) => e.target.value.length <= 5 && setNewUnitAbbreviation(e.target.value)}
                                />
                                <Button variant='icon' text='' icon={Check} onClick={handleCreateUnit} />
                                <Button variant='icon' text='' icon={X} onClick={() => { setCreatingUnit(false); setNewUnitName(''); setNewUnitAbbreviation(''); }} />
                            </div>
                        ) : (
                            <div className='flex gap-2 items-center'>
                                <Dropdown size='full' variant='modal' value={unit} selection="e.g., Kilograms" options={unitSelection} onSelect={handleSetUnit} />
                                <Button variant='icon' text='' icon={Plus} onClick={() => setCreatingUnit(true)} />
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                        <Label variant='modal' text='Unit Conversions (Optional)' />
                        <Button variant='modalOutline' size='small' text='Add Conversion' onClick={addConversionRow} />
                    </div>

                    {conversions.length === 0 && (
                        <h5 className='text-xs text-text/60'>Example: Flour base unit = kg, then set cup → 0.2 (1 cup = 0.2 kg).</h5>
                    )}

                    <div className='flex flex-col gap-2'>
                        {conversions.map((row, index) => (
                            <div key={index} className='flex gap-2 items-center'>
                                <div className='flex-1'>
                                    <Dropdown
                                        size='full'
                                        variant='modal'
                                        value={row.from_unit_id}
                                        selection='From unit'
                                        options={compatibleUnits}
                                        onSelect={(value) => updateConversionRow(index, 'from_unit_id', value)}
                                    />
                                </div>
                                <input
                                    type='text'
                                    value={row.multiplier_to_base}
                                    placeholder={`1 unit = ? ${selectedUnitMeta?.abbreviation || selectedUnitMeta?.name || 'base'}`}
                                    className='w-56 px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none'
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (!/^\d*\.?\d{0,6}$/.test(raw)) return;
                                        updateConversionRow(index, 'multiplier_to_base', raw);
                                    }}
                                    onBlur={() => normalizeConversionRow(index)}
                                />
                                <Button variant='icon' text='' icon={X} onClick={() => removeConversionRow(index)} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className='flex-1 flex flex-col gap-2'>
                    <Label variant='modal' text='Purchase Date'/>
                    <DatePicker selected={purchaseDate} onSelect={setPurchaseDate} />
                </div>

                <div className='flex-1 flex flex-col gap-2'>
                    <Label variant='modal' text='Purchase Price (per unit)'/>
                    <input
                        type='text'
                        placeholder='Enter purchase price'
                        value={purchasePrice}
                        onChange={(e) => {
                            const raw = e.target.value;
                            if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
                            setPurchasePrice(raw);
                        }}
                        className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                    />
                </div>

                <div className='flex-1 flex flex-col gap-2'>
                    <Label variant='modal' text='Expiration Date'/>
                    <DatePicker selected={expirationDate} onSelect={setExpirationDate} />
                </div>

                { showModalFeedback &&
                    <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                }

                <div className='flex gap-4 mt-4 ml-auto'>
                    <Button variant='modalOutline' size='modalSize' text='Cancel' onClick={onClose}/>
                    <Button variant='modalBlock' size='modalSize' text='Add Item' onClick={handleSetShowConfirm}/>
                </div>
            </div>

            {showConfirm &&
                <ConfirmationModal title={"Add Item?"} content={"Are you sure you want to add this item?"} onReject={handleSetCloseConfirm} onConfirm={handleConfirm} />
            }
        </ModalBody>
    )
}

export default InventoryAddItem;