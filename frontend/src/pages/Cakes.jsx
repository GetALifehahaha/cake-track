import React, { useState } from 'react';
import { Button } from '../components/atoms';
import { ProductCard } from '../components/molecules';
import { Plus } from 'lucide-react';
import { AddCakeModal, EditCakeModal } from '../components/organisms';
import useCakes from '@/hooks/useCakes';
import { useToast } from '@/context/ToastContext';
import Loading from '@/components/molecules/Loading';

const Cakes = () => {
    const { addToast } = useToast();
    const { 
        data: cakeData, 
        postCake, 
        patchCake, 
        deleteCake, 
        loading, 
        error 
    } = useCakes();

    const [prepEditCake, setPrepEditCake] = useState(null);
    const [showAddCakeModal, setShowAddCakeModal] = useState(false);
    const [showEditCakeModal, setShowEditCakeModal] = useState(false);

    if (loading) return <Loading />;
    if (error) return <h5>Error loading cake data</h5>;

    const clear = () => {
        setShowAddCakeModal(false);
        setShowEditCakeModal(false);
        setPrepEditCake(null);
    };

    const addCake = async (value) => {
        if (value) {
            await postCake(value);
            addToast('Cake added successfully', 'success');
            clear();
        }
    };

    const editCake = async (value) => {
        if (value) {
            await patchCake(prepEditCake.id, value);
            addToast('Cake updated successfully', 'success');
            clear();
        }
    };

    const removeCake = async (id) => {
        await deleteCake(id);
        addToast('Cake deleted successfully', 'success');
    };

    const handlePrepEditCake = (cake) => {
        setPrepEditCake(cake);
        setShowEditCakeModal(true);
    };

    const listCakes = (cakeData?.results || []).map(cake => (
        <ProductCard
            key={cake.id}
            product={cake}
            onToggle={handlePrepEditCake}
            onDelete={() => removeCake(cake.id)}
        />
    ));

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex justify-end'>
                <Button 
                    variant='block' 
                    text='Add Cake' 
                    icon={Plus} 
                    onClick={() => setShowAddCakeModal(true)} 
                />
            </div>

            {(cakeData?.results || []).length === 0 ? (
                <div className='flex justify-center items-center h-full'>
                    <h5 className='text-sm font-medium text-text/50'>
                        No cakes available
                    </h5>
                </div>
            ) : (
                <div className='grid grid-cols-7 p-2 gap-4 w-full flex-wrap overflow-x-auto'>
                    {listCakes}
                </div>
            )}

            {showAddCakeModal && (
                <AddCakeModal
                    onConfirm={addCake}
                    onClose={() => setShowAddCakeModal(false)}
                />
            )}

            {showEditCakeModal && (
                <EditCakeModal
                    cake={prepEditCake}
                    onConfirm={editCake}
                    onClose={() => setShowEditCakeModal(false)}
                />
            )}
        </div>
    );
};

export default Cakes;
