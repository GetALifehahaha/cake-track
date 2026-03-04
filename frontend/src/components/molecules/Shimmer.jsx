

import { cn } from '@/utils/cn';

const Shimmer = ({ className }) => (
    <div className={cn('animate-pulse bg-black/8 rounded', className)} />
);

export default Shimmer;