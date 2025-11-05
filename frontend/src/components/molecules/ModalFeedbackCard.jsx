import React from 'react';
import { CheckCircle2, XCircleIcon } from 'lucide-react';
import { Label } from '../atoms';

const ModalFeedbackCard = ({type="error", label="Label", details="Details"}) => {

    const variants = {
        success: {style: "border-success-border border-2 bg-success-fill", text: 'text-success-text', icon: CheckCircle2, iconStyle: 'text-success'},
        error: {style: "border-error-border border-2 bg-error-fill", text: 'text-error-text', icon: XCircleIcon,iconStyle: 'text-error'},
    }

    const {icon: Icon} = variants[type];

    return (
        <div className={`p-4 flex items-center gap-4 rounded-lg ${variants[type].style}`}>
            <Icon size={28} className={`${variants[type].iconStyle}`} />
            <div>
                <Label variant='small' text={label} />
                <h5 className={`font-medium text-sm ${variants[type].text}`}>{details}</h5>
            </div>

            {(type=="success") && <h5 className='ml-auto text-xs font-medium text-success-text bg-success-border/50 px-2 py-0.5 rounded-full'>Ready</h5>}
        </div>
    )
}

export default ModalFeedbackCard;