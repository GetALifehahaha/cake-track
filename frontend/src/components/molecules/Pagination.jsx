import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ next, prev }) => {
    // 1. Remove useState(pageNum) - The URL is the Source of Truth

    const [searchParams, setSearchParams] = useSearchParams();

    // 2. Derive current page directly from the URL (Safe and current)
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const handleSetPageNum = (direction) => {
        // 3. Clone existing parameters (non-destructive update)
        const newParams = new URLSearchParams(searchParams);
        let newPage = currentPage;

        if (direction === "prev") {
            // Check if we can go back
            if (currentPage <= 1) {
                return;
            }
            newPage = currentPage - 1;
        } else if (direction === "next") {
            // No need to check if we can go forward; the 'disabled' attribute handles the limit
            newPage = currentPage + 1;
        }

        // 4. Update the 'page' parameter in the URL
        newParams.set('page', newPage);
        setSearchParams(newParams);

        // 5. Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div className='flex flex-row items-center gap-2 mt-auto mx-auto'>

            {/* Prev Button: Disabled if currentPage is 1 (or if API sends null for prev link) */}
            <button
                onClick={() => handleSetPageNum("prev")}
                disabled={currentPage === 1 || !prev}
                className={`p-2 rounded-sm bg-main-dark cursor-pointer transition-opacity ${(!prev || currentPage === 1) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-main-dark/80'}`}
            >
                <ChevronLeft size={18} />
            </button>

            {/* Current Page Indicator */}
            <span className='rounded-sm bg-main-dark aspect-square w-8 flex justify-center items-center font-medium'>
                <h5>{currentPage}</h5>
            </span>

            {/* Next Button: Disabled if API sends null for next link */}
            <button
                onClick={() => handleSetPageNum("next")}
                disabled={!next}
                className={`p-2 rounded-sm bg-main-dark cursor-pointer transition-opacity ${!next ? 'opacity-50 cursor-not-allowed' : 'hover:bg-main-dark/80'}`}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}

export default Pagination;