import React from 'react';

const ModalSelectionCard = React.memo(({value=0, selected=false, onClick}) => {

    const handleSelect = () => onClick(value);

    return (
        <div className={`text-text font-medium p-4 border-border/50 border rounded-lg cursor-pointer flex-1 text-center ${(selected) ? 'bg-main-dark' : ''}`} onClick={handleSelect}>
            { value ?
                <>₱{value}</> :
                'Exact'
            }
        </div>
    )
});

export default ModalSelectionCard;