import React from 'react'
import { SearchIcon } from 'lucide-react'

const Searchbar = ({onChange}) => {
    return (
        <div className='flex flex-row items-center gap-2 p-2 border-border border rounded-2xl '>
            <SearchIcon className='text-accent'/>

            <input type='text' placeholder='Search' className='accent-accent-mute placeholder:text-text-light focus:outline-none px-2 w-full'/>
        </div>
    )
}

export default Searchbar