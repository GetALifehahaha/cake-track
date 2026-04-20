import React, { useEffect, useMemo, useState } from 'react';
import { Label, Button, Dropdown, } from '../../atoms';
import { ModalFeedbackCard, DatePicker, ModalBody, ModalErrorState } from '../../molecules';
import ConfirmationModal from '../ConfirmationModal';
import { X, Plus } from 'lucide-react';
import useUnits from '@/hooks/useUnits';
import useContainers from '@/hooks/useContainers';
import { EditInventorySkeleton } from '@/components/molecules/Skeletons';
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

const mapIncomingContainers = (rows) => {
    return (rows || []).map((container) => ({
        container_id:
            container.container_id ||
            container.container?.id ||
            container.container_unit?.container_definition?.id ||
            null,
        container_amount:
            container.container_amount === null || container.container_amount === undefined
                ? (container.multiplier_to_base === null || container.multiplier_to_base === undefined
                    ? ''
                    : formatQty(container.multiplier_to_base))
                : formatQty(container.container_amount),
    }));
};

const EditInventoryItem = ({ item, onDelete, onConfirm, onClose }) => {
    const { data: units, loading, error, refresh } = useUnits();
    const {
        containerData,
        containerLoading,
        containerError,
        refresh: refreshContainers,
    } = useContainers();

    const initialContainers = useMemo(() => {
        return mapIncomingContainers(item.containers || item.conversions || []);
    }, [item]);

    const originalDimension = normalizeDimension(item?.unit?.dimension);

    const [name, setName] = useState(item.name);
    const [unit, setUnit] = useState(String(item.unit.id));
    const [selectedDimension, setSelectedDimension] = useState(originalDimension);
    const [lowAmount, setLowAmount] = useState(String(item.low_amount ?? 0));
    const [nearExpirationDays, setNearExpirationDays] = useState(String(item.near_expiration_days ?? 7));
    const [containers, setContainers] = useState(initialContainers);
    const [containersTouched, setContainersTouched] = useState(false);

    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [showEditConfirmationModal, setShowEditConfirmationModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);

    const groupedUnits = useMemo(() => {
        const groups = {
            weight: [],
            volume: [],
            count: [],
        };

        (units || []).forEach((unitItem) => {
            const key = normalizeDimension(unitItem.dimension);
            if (groups[key]) {
                groups[key].push(unitItem);
            }
        });

        return groups;
    }, [units]);

    const dimensionSelection = useMemo(() => {
        const available = DIMENSION_ORDER.filter((key) => groupedUnits[key]?.length > 0);

        return available.map((key) => ({
            key: capitalize(key),
            value: key,
        }));
    }, [groupedUnits]);

    const activeUnits = useMemo(() => groupedUnits[selectedDimension] || [], [groupedUnits, selectedDimension]);

    const unitSelection = useMemo(() => {
        return activeUnits.map((unitItem) => ({
            key: `${unitItem.name}${unitItem.abbreviation ? ` (${unitItem.abbreviation})` : ''}`,
            value: String(unitItem.id),
        }));
    }, [activeUnits]);

    const containerSelection = useMemo(() => {
        return (containerData || []).map((container) => ({
            key: `${container.name}${container.symbol ? ` (${container.symbol})` : ''}`,
            value: String(container.id),
        }));
    }, [containerData]);

    useEffect(() => {
        if (!units?.length) return;

        const hasDimension = selectedDimension && (groupedUnits[selectedDimension] || []).length > 0;
        if (!hasDimension) {
            const fallback = DIMENSION_ORDER.find((key) => (groupedUnits[key] || []).length > 0);
            if (!fallback) return;

            const fallbackUnit = groupedUnits[fallback].find((entry) => entry.is_base) || groupedUnits[fallback][0];
            setSelectedDimension(fallback);
            setUnit(fallbackUnit ? String(fallbackUnit.id) : null);
            return;
        }

        const unitInDimension = (groupedUnits[selectedDimension] || []).some((entry) => String(entry.id) === String(unit));
        if (unitInDimension) return;

        const nextUnit = groupedUnits[selectedDimension].find((entry) => entry.is_base) || groupedUnits[selectedDimension][0];
        setUnit(nextUnit ? String(nextUnit.id) : null);
    }, [units, groupedUnits, selectedDimension, unit]);

    if (loading || containerLoading) return <EditInventorySkeleton onClose={onClose} />
    if (error || containerError) {
        const handleRetry = async () => {
            await Promise.all([refresh(), refreshContainers()]);
        };

        return <ModalErrorState onClose={onClose} onRetry={handleRetry} title='Failed to load inventory data' details='Unable to fetch units and containers for inventory editing.' />
    }

    const selectedUnitMeta = units.find((entry) => String(entry.id) === String(unit));
    const selectedDimensionNormalized = normalizeDimension(selectedUnitMeta?.dimension || selectedDimension);
    const dimensionChanged = selectedDimensionNormalized !== originalDimension;
    const unitChanged = String(unit) !== String(item.unit.id);

    const handleName = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return

        setName(e.target.value)
    }

    const handleDimension = (value) => {
        setSelectedDimension(value);

        const nextUnits = groupedUnits[value] || [];
        const defaultUnit = nextUnits.find((entry) => entry.is_base) || nextUnits[0];
        setUnit(defaultUnit ? String(defaultUnit.id) : null);

        if (value !== originalDimension) {
            setLowAmount('0');
        }

        setContainers([]);
        setContainersTouched(true);
    }

    const handleUnit = (value) => {
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
    }

    const closeUnitModal = async () => {
        setShowUnitModal(false);
        await Promise.all([refresh(), refreshContainers()]);
    }

    const addContainerRow = () => {
        setContainersTouched(true);
        setContainers(prev => [...prev, { container_id: null, container_amount: '' }]);
    };

    const removeContainerRow = (index) => {
        setContainersTouched(true);
        setContainers(prev => prev.filter((_, idx) => idx !== index));
    };

    const updateContainerRow = (index, key, value) => {
        setContainersTouched(true);
        setContainers(prev => prev.map((row, idx) => idx === index ? { ...row, [key]: value } : row));
    };

    const normalizeContainerRow = (index) => {
        setContainers(prev => prev.map((row, idx) => {
            if (idx !== index || row.container_amount === '') return row;
            return { ...row, container_amount: formatQty(row.container_amount) };
        }));
    };

    const handleConfirm = () => {
        if (!name || !selectedDimension || !unit || lowAmount === '' || nearExpirationDays === '') {
            setModalFeedbackContent({ type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.` })
            setShowModalFeedback(true);
            return;
        }

        if (Number(nearExpirationDays) <= 0) {
            setModalFeedbackContent({
                type: "error",
                label: "Invalid Near Expiry Threshold",
                details: "Near expiry threshold must be at least 1 day.",
            });
            setShowModalFeedback(true);
            return;
        }

        if (dimensionChanged && Number(lowAmount || 0) !== 0) {
            setModalFeedbackContent({
                type: "error",
                label: "Set Threshold to Zero",
                details: "Changing between Weight, Volume, and Count requires low stock threshold to be 0.",
            });
            setShowModalFeedback(true);
            return;
        }

        const normalizedContainers = containers
            .filter(entry => entry.container_id && Number(entry.container_amount) > 0)
            .map(entry => ({
                container_id: Number(entry.container_id),
                container_amount: entry.container_amount,
            }));

        const payload = {
            id: item.id,
            name,
            low_amount: Number(lowAmount || 0),
            near_expiration_days: Number(nearExpirationDays),
            unit_id: Number(unit),
        };

        if (dimensionChanged) {
            payload.reset_stock_on_dimension_change = true;
        }

        if (!unitChanged || containersTouched || dimensionChanged) {
            payload.containers = normalizedContainers;
        }

        onConfirm(payload)
    }

    const handleDelete = () => {
        // toggleDeleteConfirmationModal();
        onDelete(item.id)
    }

    // CONFIRMATION MODAL

    const toggleDeleteConfirmationModal = () => setShowDeleteConfirmationModal(!showDeleteConfirmationModal);
    const toggleEditConfirmationModal = () => setShowEditConfirmationModal(!showEditConfirmationModal);

    return (
        <ModalBody title='Edit Inventory Item' subtitle='Modify the product by editing in the detail below or delete the current product.' onClose={onClose}>
            <div className=' flex flex-row gap-8'>
                <div className='flex-1 flex flex-col gap-2'>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Item Name' />
                        <input type='text' placeholder='e.g., Chocolate Cake' value={name} onChange={handleName}
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Unit Type' />
                        <Dropdown
                            size='full'
                            variant='modal'
                            value={selectedDimension}
                            selection="Weight, Volume, or Count"
                            options={dimensionSelection}
                            onSelect={handleDimension}
                            allowNone={false}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Base Measurement' />
                        <div className='flex gap-2 items-center'>
                            <Dropdown size='full' variant='modal' value={unit} selection="Select base unit" options={unitSelection} onSelect={handleUnit} allowNone={false} />
                            <Button variant='icon' text='' icon={Plus} onClick={openUnitModal} />
                        </div>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Low Stock Threshold' />
                        <input
                            type='text'
                            value={lowAmount}
                            placeholder='Enter low stock threshold'
                            onChange={handleLowAmount}
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Near Expiry Threshold (Days)' />
                        <input
                            type='text'
                            value={nearExpirationDays}
                            placeholder='Enter days'
                            onChange={handleNearExpirationDays}
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                        />
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

                        {dimensionChanged && (
                            <h5 className='text-xs text-warning'>You changed the unit type. Stocks and recipe amounts will reset to zero after saving.</h5>
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
                </div>
            </div>

            {showModalFeedback &&
                <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
            }

            <div className='flex gap-4 mt-4 ml-auto'>
                <Button variant='error' size='modalSize' text='Delete' onClick={toggleDeleteConfirmationModal} />
                <Button variant='modalBlock' size='modalSize' text='Save' onClick={toggleEditConfirmationModal} />
            </div>

            {showEditConfirmationModal &&
                <ConfirmationModal title="Edit Inventory Details?" content="Are you sure you want to edit this inventory details?" onConfirm={handleConfirm} onReject={toggleEditConfirmationModal} />
            }

            {showDeleteConfirmationModal &&
                <ConfirmationModal title="Delete Inventory Item?" content="Are you sure you want to delete this item?" onConfirm={handleDelete} onReject={toggleDeleteConfirmationModal} />
            }

            {showUnitModal &&
                <UnitModal onClose={closeUnitModal} />
            }
        </ModalBody>
    )
}

export default EditInventoryItem;