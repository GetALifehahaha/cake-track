import React from 'react';

const Title = ({variant="page", text="Text"}) => {

    const titleVariants = {
        modal: 'text-md font-bold text-text',
        page: 'text-xl font-semibold text-accent-text',
        block: 'text-md font-semibold text-accent-text',
        
    }

    return (
        <div className={titleVariants[variant]}>{text}</div>
    )
}

export default Title;