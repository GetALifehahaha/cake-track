import { X } from 'lucide-react';
import React from 'react';

const PreviewImage = ({ src, onClose }) => {
    if (!src) return null;

    return (
        <div className='fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-xs flex justify-center items-center p-4 z-50'>
            <div className='relative h-[90vh] max-w-[90vw] rounded-xl flex justify-center items-center'>
                
                {/* Close Button */}
                <X 
                    className='absolute -top-10 right-0 md:top-4 md:right-4 text-white cursor-pointer bg-black/20 rounded-full p-1 hover:bg-black/40 transition-colors' 
                    size={32} 
                    onClick={onClose} 
                />
                
                {/* Image */}
                <img 
                    src={src} 
                    className='max-h-full max-w-full object-contain rounded-lg shadow-2xl' 
                    alt="Full Preview"
                />
            </div>
        </div>
    )
}

export default PreviewImage;