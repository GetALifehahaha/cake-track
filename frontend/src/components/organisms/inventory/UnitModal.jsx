import React, { useMemo } from 'react';
import { ModalBody, ModalErrorState } from '../../molecules';
import { Button } from '../../atoms';
import useUnits from '@/hooks/useUnits';
import { CRUDModalSkeleton } from '@/components/molecules/Skeletons';

const UnitModal = ({ onClose }) => {
    const { data: unitData, loading: unitLoading, error: unitError, refresh } = useUnits();

    if (unitLoading) return <CRUDModalSkeleton title='Unit Reference' subtitle='Static units used by inventory calculations' onClose={onClose} />
    if (unitError) return <ModalErrorState onClose={onClose} onRetry={refresh} title='Failed to load units' details='Unable to load units right now. Please try reloading this modal.' />;

    const groupedUnits = useMemo(() => {
        const groups = {
            weight: [],
            volume: [],
            count: [],
            other: [],
        };

        (unitData || []).forEach((unit) => {
            const raw = String(unit.dimension || '').toLowerCase();
            const normalized = raw === 'mass' ? 'weight' : raw;

            if (groups[normalized]) {
                groups[normalized].push(unit);
                return;
            }

            groups.other.push(unit);
        });

        return groups;
    }, [unitData]);

    const renderUnitGroup = (title, items) => {
        if (!items || items.length === 0) return null;

        return (
            <div className='flex flex-col gap-2'>
                <h5 className='text-text mt-2'>{title}</h5>
                <div className='flex flex-col gap-2'>
                    {items.map((unit) => (
                        <div key={unit.id} className='flex items-center gap-3 p-4 rounded-xl border border-border bg-main-white'>
                            <span className='flex-1 font-medium text-text'>
                                {unit.name} {unit.abbreviation ? `(${unit.abbreviation})` : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <ModalBody className='w-[60vw]' title='Unit Reference' subtitle='Units are now static and maintained by the system.' onClose={onClose}>
            <div className='flex flex-col gap-2 w-full'>

                {renderUnitGroup('Weight', groupedUnits.weight)}
                {renderUnitGroup('Volume', groupedUnits.volume)}
                {renderUnitGroup('Count', groupedUnits.count)}
                {renderUnitGroup('Other', groupedUnits.other)}
            </div>

            <div className='flex justify-end mt-4'>
                <Button text='Close' variant='modalOutline' onClick={onClose} />
            </div>
        </ModalBody>
    );
};

export default UnitModal;