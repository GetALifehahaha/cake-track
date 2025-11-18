import React, { useState } from 'react';
import { Button, Title } from '@/components/atoms';
import { ChevronLeft, ChevronRight, EllipsisVertical, Pen, Plus } from 'lucide-react';
import { AddRecipeModal, EditRecipeModal } from '@/components/organisms';

const Recipe = () => {

    const [pageNum, setPageNum] = useState(1);

    const [recipes, setRecipes] = useState([
        {   id: 1,
            name: "Chocolate Cake", ingredients: [
            {amount: 1, unit: "cup", name: "Flour"},
            {amount: 1, unit: "cup", name: "Cocoa Powder"},
        ]}
    ]);

    const [prepEditRecipe, setPrepEditRecipe] = useState(null);

    const [showAddRecipe, setShowAddRecipe] = useState(false);
    const [showEditRecipe, setShowEditRecipe] = useState(false);

    const handleSetPageNum = (direction) => {
        if (direction == "prev") {
            if (pageNum - 1 == 0) {
                return;
            }

            setPageNum(p => p-1);
        } else if (direction == "next") {
            setPageNum(p => p+1)
        }
    }

    const handleSetShowAddRecipe = () => {
        setShowAddRecipe(!showAddRecipe);
    }

    const handleAddRecipe = (recipe) => {
        setRecipes([...recipes, recipe])
        handleSetShowAddRecipe();
    }

    const handlePrepEditRecipe = (recipe) => {
        setPrepEditRecipe(recipe);
        handleSetShowEditRecipe();
    }

    const handleSetShowEditRecipe = () => {
        setShowEditRecipe(!showEditRecipe);
    }
    
    const handleEditRecipe = (value) => {
        const updatedRecipe = recipes.map((recipe, index) => recipe.id === value.id ? value : recipe)
        setRecipes(updatedRecipe);
        setShowEditRecipe(!showEditRecipe);
        setPrepEditRecipe(null);
    }
    
    const handleDeleteRecipe = (id) => {
        setRecipes(recipes => recipes.filter((recipe) => recipe.id != id))
        setShowEditRecipe(!showEditRecipe);
        setPrepEditRecipe(null);
    }

    const listRecipes = recipes.map((recipe, index) => 
        <div className='bg-main-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md' key={index}>
            <div className='flex justify-between items-start'>
                <h5 className='text-text font-semibold'>{recipe.name}</h5>
                <Pen className='cursor-pointer' onClick={() => handlePrepEditRecipe(recipe)} size={16} />
            </div>

            <div className='flex flex-col gap-1 px-8 py-4 text-text/50 text-sm'>
                {
                    recipe.ingredients.map((ingredient) => 
                    <li>
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </li>
                    )
                }
            </div>
            
        </div>
    )

    return (
        <div className='flex flex-col h-full'>
            <Title variant='page' text='Recipe Management'/>

            <div className='mt-8 border-accent-mute border rounded-lg p-4 min-h-4/5 flex flex-col' >
                <span className='ml-auto'>
                    <Button text='Add Recipe' icon={Plus} variant='block' onClick={handleSetShowAddRecipe} />
                </span>

                <div className='grid grid-cols-4 gap-4'>
                    {listRecipes}
                </div>

                {/* Pagination */}
                <div className='flex flex-row items-center gap-2 mt-auto mx-auto'>
                    <button onClick={() => handleSetPageNum("prev")} className='p-2 rounded-sm bg-main-dark cursor-pointer'>
                        <ChevronLeft size={18}/>
                    </button>
                    <span className='rounded-sm bg-main-dark aspect-square w-6 flex justify-center items-center'>
                        <h5>
                            {pageNum}
                        </h5>
                    </span>
                    <button onClick={() => handleSetPageNum("next")} className='p-2 rounded-sm bg-main-dark cursor-pointer'>
                        <ChevronRight size={18}/>
                    </button>
                </div>
            </div>

            {showAddRecipe && <AddRecipeModal onConfirm={handleAddRecipe} onClose={handleSetShowAddRecipe}/>}

            {showEditRecipe && <EditRecipeModal recipe={prepEditRecipe} onConfirm={handleEditRecipe} onClose={handleSetShowEditRecipe} onDelete={handleDeleteRecipe}/>}
        </div>
    )
}

export default Recipe;