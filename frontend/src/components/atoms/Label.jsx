import React from 'react'

const Label = ({text="Text", variant='medium'}) => {

    const labelVariants = {
        medium: 'text-text/50 font-semibold text-md',
        small: 'text-text/50 font-semibold text-sm',
    }

    return (
        <h5 className={labelVariants[variant]}>{text}</h5>
    )
}

export default Label