import React, { useState } from 'react';
import { Label, Title, Button, Dropdown, } from '../../atoms';
import { ModalFeedbackCard, DatePicker, ModalBody } from '../../molecules';
import { X } from 'lucide-react';
import useUnits from '@/hooks/useUnits';

const EditInventoryItem = ({ item, onDelete, onConfirm, onClose }) => {
    const {data: units, loading, error} = useUnits()

    console.log(item)
    
    const [name, setName] = useState(item.name);
    const [unit, setUnit] = useState(item.unit.id);

    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    if (loading) return <h5>Loading Units</h5>
    if (error) return <h5>Error loading units</h5>

    const unitSelection = units.map(unit => ({
        key: unit.name, value: unit.id
    }))

    const handleName = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return

        setName(e.target.value)
    }

    const handleUnit = (value) => {
        setUnit(value)
    }

    const handleConfirm = () => {
        if (!name || !unit) {
            setModalFeedbackContent({ type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.` })
            setShowModalFeedback(true);
            return;
        }

        onConfirm({ id: item.id, name, unit_id: unit})
    }

    const capitalize = (str) => {
        return str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

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
                        <Dropdown size='full' variant='modal' value={unit} selection="e.g., Kilograms" options={unitSelection} onSelect={handleUnit} />
                    </div>
                </div>
            </div>

            {showModalFeedback &&
                <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
            }

            <div className='flex gap-4 mt-4 ml-auto'>
                <Button variant='error' size='modalSize' text='Delete' onClick={() => onDelete(item.id)} />
                <Button variant='modalBlock' size='modalSize' text='Save' onClick={handleConfirm} />
            </div>
        </ModalBody>
    )
}

export default EditInventoryItem;