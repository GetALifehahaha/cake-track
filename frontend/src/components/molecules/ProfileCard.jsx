import React from 'react';
import image from '../../assets/image/user_image.jpg';

const ProfileCard = ({user={name: "User", role: "User", imagePath: null}}) => {
    console.log(user)
    return (
        <div className='flex flex-rol gap-4 items-center ml-auto'>
            <div className='flex flex-col justify-center text-right text-sm'>
                <h5 className='text-text font-bold'>{user.first_name} {user.last_name}</h5>
                <h5 className='text-text/50 font-semibold'>{user.groups[0]}</h5>
            </div>

            {(user.imagePath) ? 
                <img src={user.imagePath} className='object-contain aspect-square rounded-full w-12 shadow-md shadow-black/40'/> 
                : 
                <div className='w-8 h-8 rounded-full bg-accent flex justify-center items-center font-bold text-white'>{user.first_name.slice(0, 1)}</div>
            }
        </div>
    )
}

export default ProfileCard;