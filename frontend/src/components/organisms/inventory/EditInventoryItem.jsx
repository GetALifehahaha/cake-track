import React, { useState, useMemo } from 'react';
import { Label, Title, Button, Dropdown, } from '../../atoms';
import { ModalFeedbackCard, DatePicker, ModalBody } from '../../molecules';
import ConfirmationModal from '../ConfirmationModal';
import { X, Plus, Check } from 'lucide-react';
import useUnits from '@/hooks/useUnits';
import { EditInventorySkeleton } from '@/components/molecules/Skeletons';

const EditInventoryItem = ({ item, onDelete, onConfirm, onClose }) => {
    const {data: units, loading, error, postUnit, refresh} = useUnits()

    const [name, setName] = useState(item.name);
    const [unit, setUnit] = useState(item.unit.id);
    const [creatingUnit, setCreatingUnit] = useState(false);
    const [newUnitName, setNewUnitName] = useState('');
    const [newUnitAbbreviation, setNewUnitAbbreviation] = useState('');

    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [showEditConfirmationModal, setShowEditConfirmationModal] = useState(false);

    const unitSelection = useMemo(() => {
        return units.map(unit => ({
            key: unit.name,
            value: unit.id
        }))
    }, [units])

    if (loading) return <EditInventorySkeleton onClose={onClose} />
    if (error) return <h5>Error loading units</h5>

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

    const handleConfirm = () => {
        if (!name || !unit) {
            setModalFeedbackContent({ type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.` })
            setShowModalFeedback(true);
            return;
        }

        onConfirm({ id: item.id, name, unit_id: unit})
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