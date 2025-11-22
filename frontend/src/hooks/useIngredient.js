import { useState, useEffect } from "react";
import IngredientApi from "../api/IngredientApi";

export default function useIngredient(all = false) {
    const [ingredientResponse, setIngredientResponse] = useState();
    const [ingredientData, setIngredientData] = useState([]);
    const [ingredientLoading, setIngredientLoading] = useState(true);
    const [ingredientError, setIngredientError] = useState(null);

    const fetchIngredients = async () => {
        setIngredientLoading(true);
        try {
            if (all) {
                const data = await IngredientApi(null, null, true, "GET");
                setIngredientData(data);
            } else {
                const data = await IngredientApi();
                setIngredientData(data);
            }
        } catch (err) {
            setIngredientError({ status: "error", detail: "Failed to read ingredients." });
        } finally {
            setIngredientLoading(false);
        }
    };

    const postIngredient = async (params) => {
        setIngredientLoading(true);
        try {
            await IngredientApi(params, null, null, "POST");
            setIngredientResponse({ status: "success", detail: "Ingredient created successfully." });
        } catch (err) {
            setIngredientError({ status: "error", detail: "Failed to create ingredient." });
            setIngredientResponse(null);
        } finally {
            setIngredientLoading(false);
        }
    };

    const patchIngredient = async (id, params) => {
        setIngredientLoading(true);
        try {
            await IngredientApi(params, id, null, "PATCH");
            setIngredientResponse({ status: "success", detail: "Ingredient edited successfully." });
            fetchIngredients();
        } catch (err) {
            setIngredientError({ status: "error", detail: "Failed to edit ingredient." });
            setIngredientResponse(null);
        } finally {
            setIngredientLoading(false);
        }
    };

    const deleteIngredient = async (id) => {
        setIngredientLoading(true);
        try {
            await IngredientApi(null, id, null, "DELETE");
            setIngredientResponse({ status: "success", detail: "Ingredient deleted successfully." });
        } catch (err) {
            setIngredientError({ status: "error", detail: "Failed to delete ingredient." });
            setIngredientResponse(null);
        } finally {
            setIngredientLoading(false);
        }
    };

    const refresh = () => fetchIngredients();

    useEffect(() => {
        fetchIngredients();
    }, []);

    return {
        ingredientData,
        ingredientResponse,
        ingredientLoading,
        ingredientError,
        fetchIngredients,
        postIngredient,
        patchIngredient,
        deleteIngredient,
        refresh
    };
}
