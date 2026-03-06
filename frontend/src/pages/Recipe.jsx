import React, { useState } from 'react';
import { Button, Title } from '@/components/atoms';
import { ChevronLeft, ChevronRight, Plus, AlertCircle, EllipsisVertical, Edit } from 'lucide-react';
import { AddRecipeModal, EditRecipeModal } from '@/components/organisms';
import useRecipe from '@/hooks/useRecipe';
import { Pagination } from '@/components/molecules';
import Loading from '@/components/molecules/Loading';
import { useToast } from '@/context/ToastContext';
import ViewRecipeModal from '@/components/organisms/recipe/ViewRecipeModal';
import { RecipeSkeleton } from '@/components/molecules/Skeletons';

const Recipe = () => {

    const { addToast } = useToast();
    const { data, loading, error, postRecipe, patchRecipe, deleteRecipe } = useRecipe();
    const [showAddRecipe, setShowAddRecipe] = useState(false);

    const [viewRecipe, setViewRecipe] = useState(null);
    const [showEditRecipe, setShowEditRecipe] = useState(null);
    
    if (loading) return <RecipeSkeleton />
    if (error) return <h5>Error...</h5>

    const selectViewRecipe = (recipe) => {
        setViewRecipe(recipe)
    }

    const handleSetShowAddRecipe = () => {
        setShowAddRecipe(!showAddRecipe);
    };

    const addRecipe = async (payload) => {
        try {
            await postRecipe(payload);
            setShowAddRecipe(false);
            addToast("A new recipe has been added!");
        } catch (err) {
            addToast("Failed to add new recipe", "error");
        }
    };

    const handleShowEditRecipe = (value) => {
        selectViewRecipe(null);
        setShowEditRecipe(value);
    }

    const editRecipe = async (id, payload) => {
        try {
            await patchRecipe(id, payload);
            setShowEditRecipe(null);
            addToast("A recipe has been edited!");
        } catch (err) {
            addToast("Failed to edit recipe", "error");
        }
    }

    const handleDeleteRecipe = async (id) => {
        try {
            await deleteRecipe(id);
            setShowEditRecipe(null);
            selectViewRecipe(null);
            addToast("A recipe has been deleted!");
        } catch (err) {
            addToast("Failed to delete recipe", "error");
        }
    }

    const listRecipes = data.results?.map((recipe) => (
        <div 
            key={recipe.id} 
            onClick={() => selectViewRecipe(recipe)}
            className='relative flex flex-col p-4 bg-main-white rounded-lg shadow-sm border border-border/50 cursor-pointer hover:-translate-y-1 transition'>
            {!recipe.is_available && (
                <div className='absolute top-2 right-2 flex items-center gap-1 bg-error-fill text-error aspect-square p-2 rounded-full text-xs font-medium '>
                    <AlertCircle size={18} />
                </div>
            )}
            <h3 className='font-semibold text-lg text-text mt-2'>{recipe.name}</h3>
            
            <div className='flex-1'>
                <h5 className='text-xs font-semibold text-text/50 uppercase mb-2'>Ingredients</h5>
                <ul className='flex flex-col gap-1'>
                    {recipe.ingredients.map(ing => (
                        <li key={ing.ingredient_id} className='text-sm text-text'>
                            • {ing.amount_needed} {ing.ingredient_unit} {ing.ingredient_name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    ));

    return (
        <div className='h-full flex flex-col p-6'>
            <Title text='Recipes' />
            <div className='mt-8 border-accent-mute border rounded-lg p-6 flex-1 flex flex-col bg-accent-mute/5' >
                <span className='ml-auto mb-6'>
                    <Button text='Add Recipe' icon={Plus} variant='block' onClick={handleSetShowAddRecipe} />
                </span>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {listRecipes}
                </div>

                <Pagination next={data.next} prev={data.prev}/>
            </div>

            {showAddRecipe && <AddRecipeModal onConfirm={addRecipe} onClose={handleSetShowAddRecipe}/>}

            <ViewRecipeModal recipe={viewRecipe} onClose={() => selectViewRecipe(null)} onEdit={handleShowEditRecipe} onDelete={handleDeleteRecipe} />

            {showEditRecipe &&
            <EditRecipeModal recipe={showEditRecipe} onClose={() => handleShowEditRecipe(null)} onConfirm={editRecipe} />
            }
        </div>
    );
};

export default Recipe;