import React from 'react'

const StockLabel = ({amount}) => {

	if (amount > 9) return <h5 className='text-success font-semibold'>In stock</h5>
	else if (amount == 0) return <h5 className='text-error font-semibold'>Out of Stock</h5>
	else return <h5 className='text-warning font-semibold'>Running Low</h5>
}

export default StockLabel