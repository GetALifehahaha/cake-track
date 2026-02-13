import React from 'react'

const StockLabel = ({amount}) => {

	if (amount > 9) return <h5 className='p-1 px-2 rounded-lg bg-success-border w-fit text-success-text text-sm font-medium'>In stock</h5>
	else if (amount == 0) return <h5 className='p-1 px-2 rounded-lg bg-error-border w-fit text-error-text text-sm font-medium'>Out of Stock</h5>
	else return <h5 className='p-1 px-2 rounded-lg bg-warning-border w-fit text-warning-text text-sm font-medium'>Running Low</h5>
}

export default StockLabel