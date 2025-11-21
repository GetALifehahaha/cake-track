import React, { useEffect, useState } from 'react'
import {Button} from '../atoms';
import { ModalBody, DatePicker } from '../molecules'
import useIngredient from '@/hooks/useIngredient';
import { Title } from '../atoms';
import { X } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import useInventoryTransaction from '@/hooks/useInventoryTransaction';

const InventoryInOut = ({onConfirm, onClose}) => {

	const {ingredientData, ingredientLoading, ingredientError} = useIngredient(true);
	const {postInventoryTransaction, inventoryTransactionLoading, inventoryTransactionError} = useInventoryTransaction();
	const [ingredientItems, setIngredientItems] = useState([
	]);
	const [showConfirm, setShowConfirm] = useState(false);

	if (ingredientLoading) return <h5>Loading</h5>
	if (ingredientError) return <h5>Error</h5>
	if (inventoryTransactionLoading) return <h5>Loading</h5>
	if (inventoryTransactionError) return <h5>Error</h5>

	const addIngredientItem = (id, name) => {
		if (ingredientItems.some(ingredient => ingredient.ingredient_id === id)) return;

		setIngredientItems(prev => [
			...prev,
			{ ingredient_id: id, name: name, amount: 0, transaction_type: 'in', expiration_date: '', purchase_date: '' }
		]);
	};

	const removeIngredientItem = (index) => {
		setIngredientItems(ingredientItems.filter((_, i) => i !== index));
	};

	const updateIngredientItem = (index, field, value) => {
		const updatedField = ingredientItems.map((item, i) => {
			return index === i ? {...item, [field]: field === "amount" && value > 0 ? Number.parseFloat(value) : value}
				:
				item
			}
		)

		if (field == "transaction_type" && value == "out") {
			updatedField[index].expiration_date = '',
			updatedField[index].purchase_date = '';
		}

		setIngredientItems(updatedField)
	}

	const handleSetShowConfirm = () => setShowConfirm(true);
	const handleSetCloseConfirm = () => setShowConfirm(false);

	const updateIngredients = async () => {
		const payload = {
			transactions: ingredientItems.map(item => ({
				ingredient_id: item.ingredient_id,
				amount: item.amount,
				transaction_type: item.transaction_type,
				...(item.transaction_type === 'in' ? {
					expiration_date: item.expiration_date.toISOString().split('T')[0],
					purchase_date: item.purchase_date.toISOString().split('T')[0]
				} : {})
			}))
			}

		await postInventoryTransaction(payload)

		handleSetCloseConfirm()
	}

	const listIngredients = ingredientData.map((ingredient) => 
		<div key={ingredient.id} className='flex flex-row gap-4 p-2 rounded-sm border border-border text-text font-semibold cursor-pointer' onClick={() => addIngredientItem(ingredient.id, ingredient.name)}>
			<h5>{ingredient.name}</h5>
			<h5 className='text-text/50'>{(ingredient.total_stock).replace(/\.00$/, '')}</h5>
		</div>
	)

	 const listIngredientItems = ingredientItems.map((ingredient, index) =>
		<div className='flex flex-col gap-2 w-full p-2 rounded-sm bg-main-white border border-border h-fit' key={index}>
			<div className='flex items-center gap-2 p-2 w-full ' >
				<h5 className=''>{ingredient.name}</h5>
				<input type='number' className='p-2 border-border rounded-sm border ml-auto' value={ingredient.amount} onChange={(e) => updateIngredientItem(index, 'amount', e.target.value)}/>
				
				<div className='flex flex-row gap-2 w-36'>
					<button className={`p-2 rounded-sm border border-border flex-1 ${ingredient.transaction_type == "in" ? 'bg-main-dark' : 'bg-main'}`} onClick={() => updateIngredientItem(index, 'transaction_type', 'in')}>IN</button>
					<button className={`p-2 rounded-sm border border-border flex-1 ${ingredient.transaction_type == "out" ? 'bg-main-dark' : 'bg-main'}`} onClick={() => updateIngredientItem(index, 'transaction_type', 'out')}>OUT</button>
				</div>
				<X size={16} className='text-text cursor-pointer' onClick={() => removeIngredientItem(index)} />
			</div>
			{ingredient.transaction_type == "in" &&
			<div className='w-full flex gap-2 flex-row justify-end pb-2'>
				<div className='flex flex-col w-fit'>
					<h5 className='text-sm text-center font-medium text-text/50'>Purchase Date</h5>
					<DatePicker selected={ingredient.purchase_date} onSelect={(value) => updateIngredientItem(index, 'purchase_date', value)}/>
				</div>
				<div className='flex flex-col w-fit mr-8'>
					<h5 className='text-sm text-center font-medium text-text/50'>Expiration Date</h5>
					<DatePicker selected={ingredient.expiration_date} onSelect={(value) => updateIngredientItem(index, 'expiration_date', value)}/>
				</div>
			</div>
			}
		</div>
    )

	return (
		<ModalBody> 
			<div className="flex justify-between items-center w-full">
                <Title variant='modal' text='Inventory' />
                <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
            </div>

			<div className='flex flex-row gap-2'>
				{listIngredients}
			</div>
			
			<div className='grid grid-cols-2 gap-4 w-[60vw] h-[40vh] overflow-y-auto'>
				{listIngredientItems}
			</div>

			<div className='flex gap-4 mt-4 ml-auto'>
				<Button variant='modalOutline' size='modalSize' text='Cancel' onClick={onClose}/>
				<Button variant='modalBlock' size='modalSize' text='Update Stocks' onClick={handleSetShowConfirm}/>
			</div>

			{showConfirm &&
				<ConfirmationModal title="Update stocks?" content="Are you sure you want to update your stocks?" onConfirm={updateIngredients} onReject={handleSetCloseConfirm} />
			}
		</ModalBody>
	)
}

export default InventoryInOut