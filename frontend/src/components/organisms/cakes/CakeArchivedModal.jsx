import React, { useState } from 'react';
import { Button } from '../../atoms';
import { ModalBody, ProductCard } from '../../molecules';
import useCakes from '@/hooks/useCakes';
import ConfirmationModal from '../ConfirmationModal'; // Assuming this exists based on context
import Loading from '../../molecules/Loading';

const CakeArchivedModal = ({ onRestore, onClose }) => {
    const [selectedId, setSelectedId] = useState([]);
    const { data: cakeData, loading: cakeLoading, error: cakeError } = useCakes({ isArchived: true });
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (cakeLoading) return <Loading />;
    if (cakeError) return <h5>Error loading archived cakes</h5>;

    const handleSetSelectedId = (id) => {
        if (selectedId.some((select) => select === id)) {
            setSelectedId(selectedId.filter((select) => select !== id));
        } else {
            setSelectedId(selected => [...selected, id]);
        }
    };

    const handleShowConfirmation = () => {
        if (selectedId.length) setShowConfirmation(true);
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
    };

    const restoreCake = () => {
        if (selectedId) onRestore(selectedId);
        handleCloseConfirmation();
    };

    const listArchivedCakes = (cakeData.results || []).map((cake, index) => (
        <ProductCard 
            selected={selectedId} 
            key={index} 
            product={cake} 
            isArchived={true} 
            onToggle={handleSetSelectedId} 
        />
    ));

    return (
        <ModalBody title='Archived Cakes' subtitle='View and manage your archived cakes. You can restore or permanently delete them' onClose={() => onClose(false)}>
            <div className='grid grid-cols-6 gap-4 max-h-120 overflow-y-auto p-2'>
                {listArchivedCakes.length > 0 ? listArchivedCakes : <div className="col-span-6 text-center text-gray-500">No archived cakes found.</div>}
            </div>

            <span className='ml-auto flex gap-2'>
                <Button variant='modalOutline' text='Close' onClick={() => onClose()} />
                <Button variant='modalBlock' text='Restore' suffix={selectedId.length} onClick={handleShowConfirmation} />
            </span>

            {showConfirmation &&
                <ConfirmationModal 
                    title="Unarchive Cake" 
                    content="Are you sure you want to restore this cake?" 
                    onReject={handleCloseConfirmation} 
                    onConfirm={restoreCake} 
                />
            }
        </ModalBody>
    );
};

export default CakeArchivedModal;