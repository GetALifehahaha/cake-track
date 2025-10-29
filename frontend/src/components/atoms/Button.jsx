import React from 'react'

const Button = ({variant="block", text="Button", icon: Icon, onClick}) => {

    const buttonVariants = {
        block: 'border-mute border-accent bg-accent-mute text-white',
        outline: 'border border-accent text-accent',
    }
    
    return (
        <button 
        onClick={onClick}
        className={`w-fit px-8 py-1 rounded-full flex gap-4 items-center cursor-pointer ${buttonVariants[variant]}`}>
            {Icon && <Icon width={18}/>}
            {text}
        </button>
    )
}

export default Button