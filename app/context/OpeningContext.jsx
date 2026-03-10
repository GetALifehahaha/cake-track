import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '@/api/api';
import { useToast } from './ToastContext';

export const OpeningContext = createContext();

export const OpeningProvider = ({ children }) => {
    const [openingTime, setOpeningTime] = useState(null);
    const [blockedDates, setBlockedDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [openRes, blockedRes] = await Promise.all([
                api.get('/orders/opening-time/'),
                api.get('/orders/blocked-dates/'),
            ]);

            setOpeningTime(openRes?.data ?? null);
            setBlockedDates(Array.isArray(blockedRes?.data) ? blockedRes.data : (blockedRes?.data?.results ?? []));
        } catch (err) {
            console.error('Failed to load opening hours / blocked dates', err);
            setError(err);
            showToast?.('Failed to load opening/availability data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return null;
        const parts = String(timeStr).split(':');
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1] || '0', 10);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        return h * 60 + m;
    };

    const dateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    // Convert any date input to a YYYY-MM-DD string without timezone shifts
    const toDateStr = (val) => {
        if (!val) return null;
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        if (val instanceof Date) {
            return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}-${String(val.getDate()).padStart(2, '0')}`;
        }
        // ISO string or other format — extract date part
        return String(val).split('T')[0];
    };

    const isDateInBlocked = (date) => {
        if (!blockedDates || !blockedDates.length) return false;
        const target = toDateStr(date);
        if (!target) return false;
        for (const bd of blockedDates) {
            if (!bd) continue;
            if (typeof bd === 'string') {
                if (toDateStr(bd) === target) return true;
            } else if (bd.start_date || bd.end_date || bd.start || bd.end) {
                const start = toDateStr(bd.start_date ?? bd.start);
                const end = toDateStr(bd.end_date ?? bd.end ?? bd.start_date);
                if (start && end && target >= start && target <= end) return true;
            } else if (bd.date) {
                if (toDateStr(bd.date) === target) return true;
            }
        }
        return false;
    };

    const isOrderingAllowed = (date = new Date()) => {
        if (!date) date = new Date();
        if (loading) return false;

        if (isDateInBlocked(date)) return false;

        if (!openingTime) return true;

        const openStr = openingTime.open ?? openingTime.opening_time ?? openingTime.start ?? openingTime.start_time;
        const closeStr = openingTime.close ?? openingTime.closing_time ?? openingTime.end ?? openingTime.end_time;
        const openM = parseTimeToMinutes(openStr);
        const closeM = parseTimeToMinutes(closeStr);
        if (openM == null || closeM == null) return true;

        const minutes = date.getHours() * 60 + date.getMinutes();

        if (closeM <= openM) {
            return minutes >= openM || minutes < closeM;
        }

        return minutes >= openM && minutes < closeM;
    };

    return (
        <OpeningContext.Provider value={{ openingTime, blockedDates, loading, error, refresh: fetchData, isOrderingAllowed, isDateBlocked: isDateInBlocked }}>
            {children}
        </OpeningContext.Provider>
    );
};

export const useOpening = () => useContext(OpeningContext);
