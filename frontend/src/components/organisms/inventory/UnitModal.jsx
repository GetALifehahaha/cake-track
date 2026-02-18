import React, { useState, useEffect } from 'react';
import { ModalBody } from '../../molecules';
import { Button } from '../../atoms';
import { ModalFeedbackCard } from '../../molecules';
import { ConfirmationModal } from '..';
import { Plus, Pen, Trash } from 'lucide-react';
import useUnits from '@/hooks/useUnits';

const UnitModal = ({ onClose }) => {
    const { data: unitData, loading: unitLoading, error: unitError, postUnit, refresh, deleteUnit } = useUnits();
    const [unitName, setUnitName] = useState('');
    const [unitAbbreviation, setUnitAbbreviation] = useState('');
    const [feedback, setFeedback] = useState('');
    const [showConfirmPostModal, setShowConfirmPostModal] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [prepDeleteId, setPrepDeleteId] = useState(null);

    useEffect(() => {
        refresh();
    }, []);

    if (unitLoading) return <h5>Loading units...</h5>;
    if (unitError) return <h5>Error loading units...</h5>;

    const resetFeedback = () => setFeedback('');

    const closeUnitForm = () => {
        setUnitName('');
        setUnitAbbreviation('');
    };

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

    const listUnits = unitData.map((unit, index) => (
        <div 
            key={index} 
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-main-white"
        >
            <span className="flex-1 font-medium text-text">
                {capitalize(unit.name)} {unit.abbreviation ? `(${unit.abbreviation})` : ''}
            </span>

            <Button 
                text="Edit" 
                variant="modalOutline" 
                size="fit" 
                icon={Pen} 
            />

            <Button 
                text="Delete" 
                variant="modalBlock" 
                className='bg-error' 
                size="fit" 
                icon={Trash} 
                onClick={() => prepDeleteUnit(unit.id)} 
            />
        </div>
    ));

    return (
        <ModalBody className='w-[40vw]' title='Manage Units' subtitle='Add, edit, or delete units for measurements' onClose={onClose}>
            <div className='flex flex-col gap-2 w-full'>
                
                {/* Add New Section */}
                <div className="flex flex-col gap-2">
                    <h5 className="text-text">Add New Unit</h5>
                    <div className="flex gap-2">
                        <input
                            type='text'
                            value={unitName}
                            placeholder='Unit Name (e.g. Kilogram)'
                            className="flex-[2] rounded-md px-3 py-2 bg-main-dark/50 text-text"
                            onChange={handleUnitNameChange}
                        />
                        <input
                            type='text'
                            value={unitAbbreviation}
                            placeholder='Abbr (e.g. kg)'
                            className="flex-1 rounded-md px-3 py-2 bg-main-dark/50 text-text"
                            onChange={handleUnitAbbreviationChange}
                        />
                        <Button 
                            text="Add" 
                            variant="modalBlock"
                            className='bg-text/50' 
                            size="fit" 
                            icon={Plus} 
                            onClick={handleShowConfirmPostModal} 
                        />
                    </div>
                </div>

                {/* List Section */}
                <h5 className="text-text mt-2">Existing Units</h5>
                <div className='flex flex-col gap-2 max-h-[30vh] overflow-auto'>
                    {listUnits}
                </div>
            </div>

            {feedback &&
                <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type} />
            }

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