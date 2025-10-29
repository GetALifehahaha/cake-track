import React from 'react'

const Button = ({variant="block", size="base",  text="Button", icon: Icon, onClick}) => {

    const buttonVariants = {
        block: 'border border-accent-mute bg-accent-mute text-white rounded-full px-8 py-1 ',
        outline: 'border border-gray-light text-gray rounded-xl font-semibold px-8 py-1 ',
        active: 'border border-accent-text bg-accent-text text-white rounded-full px-4 py-1 ',
        inactive: 'border border-gray-light bg-gray-light text-text rounded-full px-4 py-1 ',
        base: "text-base font-semibold",
        small: "text-sm "
    }
    
    return (
        <button 
        onClick={onClick}
        className={`w-fit  flex gap-4 items-center cursor-pointer ${buttonVariants[size]} ${buttonVariants[variant]}`}>
            {Icon && <Icon width={18}/>}
            {text}
        </button>
    )
}

export default Button