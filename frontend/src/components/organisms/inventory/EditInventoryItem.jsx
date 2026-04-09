import React, { useState, useMemo } from 'react';
import { Label, Title, Button, Dropdown, } from '../../atoms';
import { ModalFeedbackCard, DatePicker, ModalBody, ModalErrorState } from '../../molecules';
import ConfirmationModal from '../ConfirmationModal';
import { X, Plus, Check } from 'lucide-react';
import useUnits from '@/hooks/useUnits';
import { EditInventorySkeleton } from '@/components/molecules/Skeletons';
import { formatQty } from '@/utils/formatQty';
import { limitedInput } from '@/utils/safeInput';
import UnitModal from './UnitModal';

const EditInventoryItem = ({ item, onDelete, onConfirm, onClose }) => {
    const { data: units, loading, error, refresh } = useUnits()

    const [name, setName] = useState(item.name);
    const [unit, setUnit] = useState(item.unit.id);
    const [lowAmount, setLowAmount] = useState(String(item.low_amount ?? 0));
    const [containers, setContainers] = useState(
        (item.containers || item.conversions || []).map((container) => ({
            container_unit_id: container.container_unit?.id || container.from_unit?.id || container.container_unit_id || container.from_unit_id,
            container_amount: container.container_amount === null || container.container_amount === undefined
                ? (container.multiplier_to_base === null || container.multiplier_to_base === undefined
                    ? ''
                    : formatQty(container.multiplier_to_base))
                : formatQty(container.container_amount),
        }))
    );

    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [showEditConfirmationModal, setShowEditConfirmationModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);

    const unitSelection = useMemo(() => {
        return units.map(unit => ({
            key: `${unit.name}${unit.abbreviation ? ` (${unit.abbreviation})` : ''}`,
            value: unit.id
        }))
    }, [units])

    const selectedUnitMeta = useMemo(() => units.find(u => u.id === unit), [units, unit]);
    const compatibleUnits = useMemo(() => units
        .filter(u => u.id !== unit)
        .map(u => ({ key: `${u.name}${u.abbreviation ? ` (${u.abbreviation})` : ''}`, value: u.id })), [units, unit]);

    if (loading) return <EditInventorySkeleton onClose={onClose} />
    if (error) return <ModalErrorState onClose={onClose} onRetry={refresh} title='Failed to load units' details='Unable to fetch units for inventory editing.' />

    const handleName = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return

        setName(e.target.value)
    }

    const handleUnit = (value) => {
        setUnit(value)
    }

    const handleLowAmount = (e) => {
        const value = limitedInput(e, { maxLength: 9, isNumber: true });
        if (value === undefined) return;
        setLowAmount(value);
    }

    const openUnitModal = () => {
        setShowUnitModal(true);
    }

    const closeUnitModal = async () => {
        setShowUnitModal(false);
        await refresh();
    }

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

    const handleConfirm = () => {
        if (!name || !unit || lowAmount === '') {
            setModalFeedbackContent({ type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.` })
            setShowModalFeedback(true);
            return;
        }

        const normalizedContainers = containers
            .filter(entry => entry.container_unit_id && Number(entry.container_amount) > 0)
            .map(entry => ({
                container_unit_id: entry.container_unit_id,
                container_amount: entry.container_amount,
            }));

        onConfirm({ id: item.id, name, low_amount: Number(lowAmount || 0), unit_id: unit, containers: normalizedContainers })
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
                        <Label variant='modal' text='Unit' />
                        <div className='flex gap-2 items-center'>
                            <Dropdown size='full' variant='modal' value={unit} selection="e.g., Kilograms" options={unitSelection} onSelect={handleUnit} />
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