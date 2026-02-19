import React from 'react'

const StockLabel = ({amount}) => {

	if (amount == 0) return <h5 className='p-1 px-2 rounded-lg bg-error-border w-fit text-error-text text-sm font-medium'>Out of Stock</h5>
	else return <h5 className='p-1 px-2 rounded-lg bg-success-border w-fit text-success-text text-sm font-medium'>In Stock</h5>
}

export default StockLabel