import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ next, prev, count, pageParam = 'page', pageSize = 20 }) => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [inputPage, setInputPage] = useState('');
    
    const currentPageFromUrl = parseInt(searchParams.get(pageParam) || '1', 10);
    const currentPage = Number.isNaN(currentPageFromUrl) || currentPageFromUrl < 1 ? 1 : currentPageFromUrl;
    const queryPageSize = parseInt(searchParams.get('page_size') || '', 10);
    const pageSizeFromProp = Number(pageSize);
    const resolvedPageSize =
        Number.isFinite(pageSizeFromProp) && pageSizeFromProp > 0
            ? pageSizeFromProp
            : (Number.isNaN(queryPageSize) || queryPageSize <= 0 ? 20 : queryPageSize);

    const parsedCount = Number(count);
    const hasCount = Number.isFinite(parsedCount) && parsedCount >= 0;
    const totalPages = hasCount
        ? Math.max(1, Math.ceil(parsedCount / resolvedPageSize))
        : (!next ? currentPage : null);
    const maxInputLength = totalPages ? String(totalPages).length : 6;

    useEffect(() => {
        setInputPage(String(currentPage));
    }, [currentPage]);

    const setPage = (targetPage) => {
        const newParams = new URLSearchParams(searchParams);
        const boundedPage = totalPages ? Math.min(Math.max(targetPage, 1), totalPages) : Math.max(targetPage, 1);

        newParams.set(pageParam, String(boundedPage));
        setSearchParams(newParams);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSetPageNum = (direction) => {
        if (direction === 'first') {
            if (currentPage <= 1) return;
            setPage(1);
            return;
        }

        if (direction === 'prev') {
            if (currentPage <= 1 || !prev) return;
            setPage(currentPage - 1);
            return;
        }

        if (direction === 'next') {
            if (!next) return;
            setPage(currentPage + 1);
            return;
        }

        if (direction === 'last') {
            if (!totalPages || currentPage >= totalPages) return;
            setPage(totalPages);
        }
    };

    const currentDisplayPage = totalPages ? Math.min(currentPage, totalPages) : currentPage;
    const firstDisabled = currentDisplayPage <= 1;
    const prevDisabled = currentDisplayPage <= 1 || !prev;
    const nextDisabled = !next;
    const lastDisabled = !totalPages || currentDisplayPage >= totalPages;

    return (
        <div className='flex items-center w-full justify-between p-4 border-t-2 border-t-border'>
            <div className='flex items-center gap-4 font-semibold text-sm px-8 p-2.5 border border-border rounded-2xl'>
                <h5>Page: </h5>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (inputPage === '') {
                            setInputPage(String(currentPage));
                            return;
                        }

                        const parsedInput = Number.parseInt(inputPage, 10);
                        if (Number.isNaN(parsedInput)) {
                            setInputPage(String(currentPage));
                            return;
                        }

                        setPage(parsedInput);
                    }}>
                        <input
                            type="text"
                            min="1"
                            value={inputPage ?? ''}
                            onChange={(e) => {
                                const raw = e.target.value;

                                if (!/^\d*$/.test(raw)) return;
                                if (raw.length > maxInputLength) return;

                                setInputPage(raw);
                            }}
                            className="w-8 p-1.5 text-center bg-main-dark/20 rounded-md shadow-sm"
                        />
                    </form>
                <h5>of {totalPages ?? '?'}</h5>
            </div>

            <div className='flex flex-row flex-wrap items-center justify-center gap-2'>
                <button
                    onClick={() => handleSetPageNum('first')}
                    disabled={firstDisabled}
                    className={`px-2.5 py-2 rounded-sm bg-main-dark cursor-pointer transition-opacity flex items-center gap-1 text-xs font-semibold ${firstDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-main-dark/80'}`}
                >
                    <ChevronsLeft size={16} />
                </button>

                <button
                    onClick={() => handleSetPageNum('prev')}
                    disabled={prevDisabled}
                    className={`px-2.5 py-2 rounded-sm bg-main-dark cursor-pointer transition-opacity flex items-center gap-1 text-xs font-semibold ${prevDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-main-dark/80'}`}
                >
                    <ChevronLeft size={16} />
                </button>

                <span className='rounded-sm bg-main-dark h-9 min-w-18 px-3 flex justify-center items-center font-semibold text-sm'>
                    <h5>{currentDisplayPage}</h5>
                </span>

                <button
                    onClick={() => handleSetPageNum('next')}
                    disabled={nextDisabled}
                    className={`px-2.5 py-2 rounded-sm bg-main-dark cursor-pointer transition-opacity flex items-center gap-1 text-xs font-semibold ${nextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-main-dark/80'}`}
                >
                    <ChevronRight size={16} />
                </button>

                <button
                    onClick={() => handleSetPageNum('last')}
                    disabled={lastDisabled}
                    className={`px-2.5 py-2 rounded-sm bg-main-dark cursor-pointer transition-opacity flex items-center gap-1 text-xs font-semibold ${lastDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-main-dark/80'}`}
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}

export default Pagination;