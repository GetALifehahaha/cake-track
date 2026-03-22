import React, { useState, useMemo } from 'react';
import { Label, Title, Button, Dropdown, } from '../../atoms';
import { ModalFeedbackCard, DatePicker, ModalBody, ModalErrorState } from '../../molecules';
import ConfirmationModal from '../ConfirmationModal';
import { X, Plus, Check } from 'lucide-react';
import useUnits from '@/hooks/useUnits';
import { EditInventorySkeleton } from '@/components/molecules/Skeletons';
import { formatQty } from '@/utils/formatQty';

const EditInventoryItem = ({ item, onDelete, onConfirm, onClose }) => {
    const {data: units, loading, error, postUnit, refresh} = useUnits()

    const [name, setName] = useState(item.name);
    const [unit, setUnit] = useState(item.unit.id);
    const [creatingUnit, setCreatingUnit] = useState(false);
    const [newUnitName, setNewUnitName] = useState('');
    const [newUnitAbbreviation, setNewUnitAbbreviation] = useState('');
    const [conversions, setConversions] = useState(
        (item.conversions || []).map((conversion) => ({
            from_unit_id: conversion.from_unit?.id || conversion.from_unit_id,
            multiplier_to_base: conversion.multiplier_to_base === null || conversion.multiplier_to_base === undefined
                ? ''
                : formatQty(conversion.multiplier_to_base),
        }))
    );

    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [showEditConfirmationModal, setShowEditConfirmationModal] = useState(false);

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

    const handleCreateUnit = async () => {
        if (!newUnitName.trim()) {
            setModalFeedbackContent({ type: "error", label: "Incomplete Fields", details: `Unit name is required.` })
            setShowModalFeedback(true);
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
            setModalFeedbackContent({ type: "error", label: "Create Unit Failed", details })
            setShowModalFeedback(true);
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

    const handleConfirm = () => {
        if (!name || !unit) {
            setModalFeedbackContent({ type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.` })
            setShowModalFeedback(true);
            return;
        }

        const normalizedConversions = conversions
            .filter(entry => entry.from_unit_id && Number(entry.multiplier_to_base) > 0)
            .map(entry => ({
                from_unit_id: entry.from_unit_id,
                multiplier_to_base: entry.multiplier_to_base,
            }));

        onConfirm({ id: item.id, name, unit_id: unit, conversions: normalizedConversions })
    }

    const handleDelete = () => {
        // toggleDeleteConfirmationModal();
        onDelete(item.id)
    }

    const capitalize = (str) => {
        return str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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
                                <Dropdown size='full' variant='modal' value={unit} selection="e.g., Kilograms" options={unitSelection} onSelect={handleUnit} />
                                <Button variant='icon' text='' icon={Plus} onClick={() => setCreatingUnit(true)} />
                            </div>
                        )}
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
        </ModalBody>
    )
}

export default EditInventoryItem;