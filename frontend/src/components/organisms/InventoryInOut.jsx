import React, { useEffect, useState } from 'react'
import { Button } from '../atoms';
import { ModalBody, DatePicker } from '../molecules'
import useIngredient from '@/hooks/useIngredient';
import { Title } from '../atoms';
import { X } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import useInventoryTransaction from '@/hooks/useInventoryTransaction';
import Loading from '../molecules/Loading';
import { useToast } from '@/context/ToastContext';

const InventoryInOut = ({ onConfirm, onClose }) => {

	const { addToast } = useToast();
	const { ingredientData, ingredientLoading, ingredientError } = useIngredient(true);
	const { postInventoryTransaction, inventoryTransactionLoading, inventoryTransactionError } = useInventoryTransaction();
	const [ingredientItems, setIngredientItems] = useState([
	]);
	const [showConfirm, setShowConfirm] = useState(false);

	if (ingredientLoading || inventoryTransactionLoading) return <Loading />
	if (ingredientError) return <h5>Error</h5>
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
			return index === i ? { ...item, [field]: field === "amount" && value > 0 ? Number.parseFloat(value) : value }
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

		try {
			await postInventoryTransaction(payload);
			addToast("Ingredients updated successfully")
		} catch (err) {
			addToast("Failed to update ingredients")
		}


		handleSetCloseConfirm()
		onClose()
	}

	const listIngredients = ingredientData.map((ingredient) =>
		<div key={ingredient.id} className='flex flex-row gap-4 px-4 py-2 rounded-sm bg-accent font-semibold cursor-pointer' onClick={() => addIngredientItem(ingredient.id, ingredient.name)}>
			<h5 className='text-main-white line-clamp-1'>{ingredient.name}</h5>
			<h5 className='text-main/50'>{(ingredient.total_stock).replace(/\.00$/, '')}</h5>
		</div>
	)

	const listIngredientItems = ingredientItems.map((ingredient, index) =>
		<div className='flex flex-col gap-2 w-full p-2 rounded-sm bg-main-white border border-border h-fit' key={index}>
			<div className='flex items-center gap-2 p-2 w-full ' >
				<h5 className='mr-auto'>{ingredient.name}</h5>


				{ingredient.transaction_type == "in" &&
					<div className='flex gap-2 flex-row justify-end pb-2 ml-auto'>
						<div className='flex flex-col w-fit'>
							<h5 className='text-sm text-center font-medium text-text/50'>Purchase Date</h5>
							<DatePicker selected={ingredient.purchase_date} onSelect={(value) => updateIngredientItem(index, 'purchase_date', value)} />
						</div>
						<div className='flex flex-col w-fit'>
							<h5 className='text-sm text-center font-medium text-text/50'>Expiration Date</h5>
							<DatePicker selected={ingredient.expiration_date} onSelect={(value) => updateIngredientItem(index, 'expiration_date', value)} />
						</div>
					</div>
				}

				<input type='number' className='p-2 border-border rounded-sm border' value={ingredient.amount} onChange={(e) => updateIngredientItem(index, 'amount', e.target.value)} />

				<div className='flex flex-row gap-2 w-36'>
					<button className={`p-2 rounded-sm border border-border flex-1 ${ingredient.transaction_type == "in" ? 'bg-main-dark' : 'bg-main'}`} onClick={() => updateIngredientItem(index, 'transaction_type', 'in')}>IN</button>
					<button className={`p-2 rounded-sm border border-border flex-1 ${ingredient.transaction_type == "out" ? 'bg-main-dark' : 'bg-main'}`} onClick={() => updateIngredientItem(index, 'transaction_type', 'out')}>OUT</button>
				</div>
				<X size={16} className='text-text cursor-pointer' onClick={() => removeIngredientItem(index)} />
			</div>

		</div>
	)

	return (
		<ModalBody>
			{/* Header */}
			<div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-main-white w-[80vw]">
				<Title text='Inventory Management' variant='modal' />

				<X size={20} className='text-text' onClick={onClose} />
			</div>

			{/* Two Panel Layout */}
			<div className='flex flex-1 overflow-hidden max-h-[80vh]'>
				{/* Left Panel - Available Ingredients */}
				<div className='w-60 border-r border-gray-200 bg-gray-50 flex flex-col'>
					<div className='px-6 py-4 border-b border-gray-200 bg-white'>
						<h3 className='font-semibold text-gray-700 text-sm uppercase tracking-wide'>Available Ingredients</h3>
						<p className='text-xs text-gray-500 mt-1'>Click to add to transaction</p>
					</div>
					<div className='flex-1 overflow-y-auto px-6 py-4'>
						<div className='flex flex-col gap-2'>
							{listIngredients}
						</div>
					</div>
				</div>

				{/* Right Panel - Transaction Items */}
				<div className='flex-1 flex flex-col bg-white'>
					<div className='px-6 py-4 border-b border-gray-200'>
						<h3 className='font-semibold text-gray-700 text-sm uppercase tracking-wide'>Transaction Items</h3>
						<p className='text-xs text-gray-500 mt-1'>
							{ingredientItems.length === 0 ? 'No items added yet' : `${ingredientItems.length} item(s) in transaction`}
						</p>
					</div>
					<div className='flex-1 overflow-y-auto px-6 py-4'>
						{ingredientItems.length === 0 ? (
							<div className='flex items-center justify-center h-full text-gray-400'>
								<div className='text-center'>
									<p className='text-lg font-medium mb-2'>No items selected</p>
									<p className='text-sm'>Click ingredients from the left panel to add them</p>
								</div>
							</div>
						) : (
							<div className='grid gap-4'>
								{listIngredientItems}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className='flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
				<Button variant='modalOutline' text='Cancel' onClick={onClose} />
				<Button variant='modalBlock' text='Update Stocks' onClick={() => setShowConfirm(true)} />
			</div>

			{showConfirm &&
				<ConfirmationModal
					title="Update stocks?"
					content="Are you sure you want to update your stocks?"
					onConfirm={updateIngredients}
					onReject={() => setShowConfirm(false)}
				/>
			}
		</ModalBody>
	)
}

export default InventoryInOut