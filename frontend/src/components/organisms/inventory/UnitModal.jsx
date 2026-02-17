import React, { useState, useEffect } from 'react';
import { ModalBody } from '../../molecules';
import { Button, Title } from '../../atoms';
import { ModalFeedbackCard } from '../../molecules';
import { ConfirmationModal } from '..';
import { Minus, Plus, X } from 'lucide-react';
import useUnits from '@/hooks/useUnits';

const UnitModal = ({ onClose }) => {
    const { data: unitData, loading: unitLoading, error: unitError, postUnit, refresh, deleteUnit } = useUnits();
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [unitName, setUnitName] = useState('');
    const [unitAbbreviation, setUnitAbbreviation] = useState('');
    const [feedback, setFeedback] = useState('');
    const [showConfirmPostModal, setShowConfirmPostModal] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [prepDeleteId, setPrepDeleteId] = useState(null);

    // Refresh units on mount or after changes
    useEffect(() => {
        refresh();
    }, []);

    if (unitLoading) return <h5>Loading units...</h5>;
    if (unitError) return <h5>Error loading units...</h5>;

    const resetFeedback = () => setFeedback('');

    const closeUnitForm = () => {
        setUnitName('');
        setUnitAbbreviation('');
        setShowUnitForm(false);
    };

    const handleShowUnitForm = () => setShowUnitForm(true);
    const handleCloseUnitForm = () => closeUnitForm();

    const handleShowConfirmPostModal = () => {
        if (!unitName) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            });
            return;
        }
        setShowConfirmPostModal(true);
    };

    const handleCloseConfirmPostModal = () => setShowConfirmPostModal(false);

    const handleShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
    const handleCloseConfirmDeleteModal = () => setShowConfirmDeleteModal(false);

    const handlePostUnit = async () => {
        await postUnit({ name: unitName, abbreviation: unitAbbreviation });

        resetFeedback();
        closeUnitForm();
        handleCloseConfirmPostModal();
    };

    const prepDeleteUnit = (id) => {
        setPrepDeleteId(id);
        handleShowConfirmDeleteModal();
    };

    const removePrepDeleteUnit = () => {
        setPrepDeleteId(null);
        handleCloseConfirmDeleteModal();
    };

    const handleDeleteUnit = async () => {
        await deleteUnit(prepDeleteId);
        resetFeedback();
        removePrepDeleteUnit();
    };

    const handleUnitNameChange = (e) => {
        e.preventDefault();
        if (e.target.value.length > 20) return;
        setUnitName(e.target.value);
    };

    const handleUnitAbbreviationChange = (e) => {
        e.preventDefault();
        if (e.target.value.length > 5) return;
        setUnitAbbreviation(e.target.value);
    };

    const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

    const listUnits = unitData.map((unit, index) =>
        <div key={index} className='text-text font-medium flex gap-2 rounded-md p-2 bg-main-white border border-border'>
            <div className="flex-1 p-2">
                {capitalize(unit.name)} {unit.abbreviation ? `(${unit.abbreviation})` : ''}
            </div>
            <Button text='' variant='modalOutline' size='fit' icon={Minus} onClick={() => prepDeleteUnit(unit.id)} />
        </div>
    );

    return (
        <ModalBody title='Units' onClose={onClose}>
            <div className='flex flex-col gap-2 w-full'>
                <div className='flex flex-col gap-2 max-h-[50vh] overflow-auto'>
                    {listUnits}
                </div>

                <div className='flex-1'>
                    {showUnitForm ?
                        <div className='flex flex-row gap-2'>
                            <input
                                type='text'
                                value={unitName}
                                placeholder='Unit name'
                                className='rounded-sm p-2 bg-main text-text/75'
                                onChange={handleUnitNameChange}
                            />
                            <input
                                type='text'
                                value={unitAbbreviation}
                                placeholder='Abbreviation'
                                className='rounded-sm p-2 bg-main text-text/75'
                                onChange={handleUnitAbbreviationChange}
                            />
                            <Button text='' variant='modalOutline' size='fit' icon={Plus} onClick={handleShowConfirmPostModal} />
                            <Button text='' variant='modalOutline' size='fit' icon={X} onClick={handleCloseUnitForm} />
                        </div>
                        :
                        <Button text='Add Unit' variant='modalOutline' size='fit' icon={Plus} onClick={handleShowUnitForm} className='ml-auto' />
                    }
                </div>
            </div>

            {feedback &&
                <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type} />
            }

            <div className='flex gap-4 ml-auto'>
                <Button variant='modalOutline' size='base' text='Close' onClick={onClose} />
            </div>

            {showConfirmPostModal &&
                <ConfirmationModal
                    title="Add Unit?"
                    content="Are you sure you want to add this unit?"
                    onReject={handleCloseConfirmPostModal}
                    onConfirm={handlePostUnit}
                />
            }

            {showConfirmDeleteModal &&
                <ConfirmationModal
                    title="Delete Unit?"
                    content="Are you sure you want to delete this unit?"
                    onReject={removePrepDeleteUnit}
                    onConfirm={handleDeleteUnit}
                />
            }
        </ModalBody>
    );
};

export default UnitModal;
