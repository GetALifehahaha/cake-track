import React, { useEffect, useMemo, useState } from 'react';
import { Label, Button, Dropdown } from '../../atoms';
import { DatePicker, ModalBody, ModalFeedbackCard, ModalErrorState } from '../../molecules';
import { X, Plus } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';
import useUnits from '@/hooks/useUnits';
import useContainers from '@/hooks/useContainers';
import { AddInventoryItemSkeleton } from '@/components/molecules/Skeletons';
import { formatQty } from '@/utils/formatQty';
import { limitedInput } from '@/utils/safeInput';
import UnitModal from './UnitModal';

const DIMENSION_ORDER = ['weight', 'volume', 'count'];

const normalizeDimension = (value) => {
    const raw = String(value || '').toLowerCase();
    if (raw === 'mass') return 'weight';
    return raw;
};

const capitalize = (value) => value ? value[0].toUpperCase() + value.slice(1) : value;

const InventoryAddItem = ({ onConfirm, onClose }) => {

    const { data: units, loading, error, refresh } = useUnits();
    const {
        containerData,
        containerLoading,
        containerError,
        refresh: refreshContainers,
    } = useContainers();

    const [name, setName] = useState("");
    const [amount, setAmount] = useState(0);
    const [lowAmount, setLowAmount] = useState('0');
    const [nearExpirationDays, setNearExpirationDays] = useState('');
    const [unit, setUnit] = useState(null);
    const [selectedDimension, setSelectedDimension] = useState('');
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

    const groupedUnits = useMemo(() => {
        const groups = {
            weight: [],
            volume: [],
            count: [],
        };

        (units || []).forEach((unitItem) => {
            const dimensionKey = normalizeDimension(unitItem.dimension);
            if (groups[dimensionKey]) {
                groups[dimensionKey].push(unitItem);
            }
        });

        return groups;
    }, [units]);

    const dimensionSelection = useMemo(() => {
        const available = DIMENSION_ORDER.filter((dimensionKey) => groupedUnits[dimensionKey]?.length > 0);

        return available.map((dimensionKey) => ({
            key: capitalize(dimensionKey),
            value: dimensionKey,
        }));
    }, [groupedUnits]);

    const activeUnits = useMemo(() => {
        return groupedUnits[selectedDimension] || [];
    }, [groupedUnits, selectedDimension]);

    useEffect(() => {
        if (!units?.length) return;

        const dimensionExists = selectedDimension && (groupedUnits[selectedDimension] || []).length > 0;
        if (dimensionExists) return;

        const nextDimension = DIMENSION_ORDER.find((dimensionKey) => (groupedUnits[dimensionKey] || []).length > 0);
        if (!nextDimension) return;

        const defaultUnit = groupedUnits[nextDimension].find((item) => item.is_base) || groupedUnits[nextDimension][0];

        setSelectedDimension(nextDimension);
        setUnit(defaultUnit ? String(defaultUnit.id) : null);
    }, [units, groupedUnits, selectedDimension]);

    if (loading || containerLoading) return <AddInventoryItemSkeleton onClose={onClose} />
    if (error || containerError) {
        const handleRetry = async () => {
            await Promise.all([refresh(), refreshContainers()]);
        };

        return <ModalErrorState onClose={onClose} onRetry={handleRetry} title='Failed to load inventory data' details='Unable to fetch units and containers for item creation.' />;
    }

    const unitSelection = activeUnits.map((unitItem) => ({
        key: `${unitItem.name}${unitItem.abbreviation ? ` (${unitItem.abbreviation})` : ''}`,
        value: String(unitItem.id),
    }));

    const selectedUnitMeta = units.find((item) => String(item.id) === String(unit));

    const containerSelection = (containerData || []).map((container) => ({
        key: `${container.name}${container.symbol ? ` (${container.symbol})` : ''}`,
        value: String(container.id),
    }));

    const handleConfirm = () => {
        const parsedAmount = Number(amount || 0);

        const normalizedContainers = containers
            .filter(item => item.container_id && Number(item.container_amount) > 0)
            .map(item => ({
                container_id: Number(item.container_id),
                container_amount: item.container_amount,
            }));

        onConfirm({
            name,
            amount: parsedAmount,
            total_stock: parsedAmount,
            low_amount: Number(lowAmount || 0),
            near_expiration_days: Number(nearExpirationDays),
            unit_id: Number(unit),
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

    const handleSetDimension = (value) => {
        setSelectedDimension(value);

        const nextUnits = groupedUnits[value] || [];
        const defaultUnit = nextUnits.find((item) => item.is_base) || nextUnits[0];

        setUnit(defaultUnit ? String(defaultUnit.id) : null);
        setContainers([]);
    }

    const handleSetUnit = (value) => {
        setUnit(value)
    }

    const handleLowAmount = (e) => {
        const value = limitedInput(e, { maxLength: 9, isNumber: true });
        if (value === undefined) return;
        setLowAmount(value);
    }

    const handleNearExpirationDays = (e) => {
        const value = limitedInput(e, { maxLength: 4, isNumber: true });
        if (value === undefined) return;
        setNearExpirationDays(value);
    }

    const openUnitModal = () => {
        setShowUnitModal(true);
    };

    const closeUnitModal = async () => {
        setShowUnitModal(false);
        await Promise.all([refresh(), refreshContainers()]);
    };

    const addContainerRow = () => {
        setContainers(prev => [...prev, { container_id: null, container_amount: '' }]);
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
        if (!name || !amount || lowAmount === '' || nearExpirationDays === '' || !selectedDimension || !unit || !purchaseDate || !expirationDate) {
            setModalFeedbackContent({ type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.` })
            return;
        }

        if (Number(nearExpirationDays) <= 0) {
            setModalFeedbackContent({ type: "error", label: "Invalid Near Expiry Threshold", details: 'Near expiry threshold must be at least 1 day.' })
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

                <div className='flex items-center gap-4 flex-wrap'>
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
                        <Label variant='modal' text='Near Expiry Threshold' />
                        <input
                            type='text'
                            placeholder='Enter days (required)'
                            value={nearExpirationDays}
                            onChange={handleNearExpirationDays}
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                        />
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Unit Type' />
                        <Dropdown
                            size='full'
                            variant='modal'
                            value={selectedDimension}
                            selection='Weight, Volume, or Count'
                            options={dimensionSelection}
                            onSelect={handleSetDimension}
                            allowNone={false}
                        />
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Base Measurement' />
                        <div className='flex gap-2 items-center'>
                            <Dropdown size='full' variant='modal' value={unit} selection="Select base unit" options={unitSelection} onSelect={handleSetUnit} allowNone={false} />
                            <Button variant='icon' text='' icon={Plus} onClick={openUnitModal} />
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                        <Label variant='modal' text='Container Mappings (Optional)' />
                        <Button variant='modalOutline' size='small' text='Add Container' onClick={addContainerRow} disabled={containerSelection.length === 0} />
                    </div>

                    {containers.length === 0 && (
                        <h5 className='text-xs text-text/60'>Example: Flour base unit = kg, then set container Cup to 0.2 (1 cup = 0.2 kg).</h5>
                    )}

                    {containerSelection.length === 0 && (
                        <h5 className='text-xs text-error/80'>No containers yet. Use the + button beside Base Measurement to add containers first.</h5>
                    )}

                    <div className='flex flex-col gap-2'>
                        {containers.map((row, index) => (
                            <div key={index} className='flex gap-2 items-center'>
                                <div className='flex-1'>
                                    <Dropdown
                                        size='full'
                                        variant='modal'
                                        value={row.container_id}
                                        selection='Container'
                                        options={containerSelection}
                                        onSelect={(value) => updateContainerRow(index, 'container_id', value)}
                                        allowNone={false}
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