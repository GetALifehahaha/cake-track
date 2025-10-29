import React from 'react';
import image from '../../assets/image/user_image.jpg';

const ProfileCard = ({user={name: "User", role: "User", imagePath: null}}) => {
    return (
        <div className='flex flex-rol gap-4 items-center ml-auto'>
            <div className='flex flex-col justify-center text-right text-sm'>
                <h5 className='text-text font-bold'>{user.name}</h5>
                <h5 className='text-text/50 font-semibold'>{user.role}</h5>
            </div>

            {(user.imagePath) ? 
                <img src={user.imagePath} className='object-contain aspect-square rounded-full w-12 shadow-md shadow-black/40'/> 
                : 
                <img src={image} className='object-contain aspect-square rounded-full w-12 shadow-md shadow-black/20'/> 
            }
        </div>
    )
}

export default ProfileCard;