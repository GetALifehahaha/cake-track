import { useMemo } from "react";
import API_ENDPOINTS from "@/api/endpoints";
import useQueryFetch from "./useQueryFetch";

const COUNT_UNIT_NAMES = new Set(["piece", "stick"]);
const COUNT_UNIT_ABBREVIATIONS = new Set(["pcs", "stick", "stk"]);

export default function useUnits(){
    const unitsQuery = useQueryFetch("units", API_ENDPOINTS.UNITS);

    const filteredUnits = useMemo(() => {
        const units = Array.isArray(unitsQuery.data) ? unitsQuery.data : [];

        return units.filter((unit) => {
            const dimension = String(unit?.dimension || "").toLowerCase();

            if (dimension !== "count") return true;
            if (unit?.is_container_unit) return false;

            const name = String(unit?.name || "").trim().toLowerCase();
            const abbreviation = String(unit?.abbreviation || "").trim().toLowerCase();

            return COUNT_UNIT_NAMES.has(name) || COUNT_UNIT_ABBREVIATIONS.has(abbreviation);
        });
    }, [unitsQuery.data]);

    return {
        data: filteredUnits,

        loading: unitsQuery.isPending,

        error: unitsQuery.error,

        refresh: () => unitsQuery.refetch(),
    };
};