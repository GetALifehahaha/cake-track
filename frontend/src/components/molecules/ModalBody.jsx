import React, { useState } from 'react'
import { Title } from '../atoms'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const ModalBody = ({ children, className, title="Modal", onClose, subtitle='' }) => {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose(), 150);
  };

  return (
    <div
      className={cn(
        'absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10',
        !closing ? 'animate-in fade-in duration-150' : 'animate-out fade-out duration-150 fill-mode-forwards'
      )}
    >
      <div className={cn(
    'p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] max-w-[90vw] max-h-[80vh] flex flex-col gap-6 overflow-hidden',
        !closing ? 'animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-150' : 'animate-out fade-out zoom-out-95 slide-out-to-bottom-3 duration-150 fill-mode-forwards',
        className
      )}>
        <div className='flex justify-between items-start w-full'>
          <div className='flex flex-col gap-1 items-start'>
              <Title variant='modal' text={title} />
              {subtitle.length > 0 &&
                <h5 className='text-text/50 text-sm font-medium'>{subtitle}</h5>
              }
          </div>

          <X size={16} className='text-text cursor-pointer' onClick={handleClose}/>
          </div>
        {children}
      </div>
    </div>
  )
}

export default ModalBody