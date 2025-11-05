import React from 'react';

const Title = ({variant="base", text="Text"}) => {

    const titleVariants = {
        modal: 'text-md font-bold text-text'
    }

    return (
        <div className={titleVariants[variant]}>{text}</div>
    )
}

export default Title;