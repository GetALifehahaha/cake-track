import React from 'react'

const Button = ({variant="block", size="base",  text="Button", icon: Icon, onClick}) => {

    const buttonVariants = {
        main: 'w-full p-2 rounded-full bg-accent justify-center items-center text-sm font-bold text-main-white',
        block: 'w-fit border border-accent-mute bg-accent-mute text-white rounded-full px-8 py-1 ',
        outline: 'w-fit border border-gray-light text-gray rounded-xl font-semibold px-8 py-1 ',
        active: 'w-fit border border-accent-text bg-accent-text text-white rounded-full px-4 py-1 ',
        inactive: 'w-fit border border-gray-light bg-gray-light text-text rounded-full px-4 py-1 ',
        base: "w-fit text-base",
        small: "w-fit text-sm ",
        modalSize: 'w-full',
        modalOutline: "font-medium border-border border rounded-lg p-2 text-text",
        modalBlock: "font-medium border-border border rounded-lg p-2 text-main-white bg-gray-dark"
    }
    
    return (
        <button 
        onClick={onClick}
        className={`flex gap-4 items-center justify-center cursor-pointer ${buttonVariants[size]} ${buttonVariants[variant]}`}>
            {Icon && <Icon width={18}/>}
            {text}
        </button>
    )
}

export default Button