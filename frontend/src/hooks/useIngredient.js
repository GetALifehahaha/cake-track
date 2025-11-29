import { useState, useCallback, useEffect } from "react";
import IngredientApi from "../api/IngredientApi";

export default function useIngredient(all = false) {
    const [ingredientData, setIngredientData] = useState(null); // Init as null
    const [ingredientDashboard, setIngredientDashboard] = useState(null); // Init as null
    
    // Combined loading state
    const [ingredientLoading, setIngredientLoading] = useState(true);
    const [ingredientError, setIngredientError] = useState(null);
    const [ingredientResponse, setIngredientResponse] = useState(null);

    // 1. Standalone fetchers (return the promise, don't set global loading false yet)
    const fetchIngredientsPromise = useCallback(async () => {
        try {
            if (all) {
                const data = await IngredientApi(null, null, true, "GET");
                setIngredientData(data);
            } else {
                const data = await IngredientApi();
                setIngredientData(data);
            }
        } catch (err) {
            console.error(err);
            setIngredientError({ status: "error", detail: "Failed to read ingredients." });
        }
    }, [all]);

    const fetchDashboardPromise = useCallback(async () => {
        try {
            const data = await IngredientApi(null, null, null, "DASHBOARD");
            setIngredientDashboard(data);
        } catch (err) {
            console.error(err);
            // Don't overwrite main error if list failed, but log it
            console.warn("Dashboard fetch failed"); 
        }
    }, []);

    // 2. The Master Loader
    const refresh = useCallback(async () => {
        setIngredientLoading(true);
        try {
            // Wait for BOTH to finish before continuing
            await Promise.all([
                fetchIngredientsPromise(),
                fetchDashboardPromise()
            ]);
        } catch (err) {
            setIngredientError(err);
        } finally {
            // Only stop loading when EVERYTHING is done
            setIngredientLoading(false);
        }
    }, [fetchIngredientsPromise, fetchDashboardPromise]);

    // 3. Modifying Write Operations to auto-refresh
    const postIngredient = async (params) => {
        setIngredientLoading(true);
        try {
            await IngredientApi(params, null, null, "POST");
            setIngredientResponse({ status: "success", detail: "Ingredient created successfully." });
            await refresh(); // Auto refresh list after add
        } catch (err) {
            setIngredientError({ status: "error", detail: "Failed to create ingredient." });
        } finally {
            setIngredientLoading(false);
        }
    };

    // ... (Repeat pattern for patch and delete) ...

    // Initial Load
    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        ingredientData,
        ingredientDashboard,
        ingredientResponse,
        ingredientLoading,
        ingredientError,
        postIngredient,
        refresh,
    };
}