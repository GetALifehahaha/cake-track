import { useState, useEffect } from "react";
import CategoryApi from "../api/CategoryApi";
import { useParams, useSearchParams } from "react-router-dom";

export default function useCategory() {
    const [categoryResponse, setCategoryResponse] = useState();
    const [categoryData, setCategoryData] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [categoryError, setCategoryError] = useState(null);

    const fetchCategories = async () => {
        setCategoryLoading(true);
        try {
            const data = await CategoryApi();
            setCategoryData(data);
        } catch (err) {
            setCategoryError({ status: "error", detail: "Failed to read category." });
        } finally {
            setCategoryLoading(false);
        }
    };

    const postCategory = async (params) => {
        setCategoryLoading(true);
        try {
            await CategoryApi(params, null, "POST");
            setCategoryResponse({ status: "success", detail: "Category created successfully." });
        } catch (err) {
            setCategoryError({ status: "error", detail: "Failed to create category." });
            setCategoryResponse(null);
        } finally {
            setCategoryLoading(false);
        }
    };

    const patchCategory = async (id, params) => {
        setCategoryLoading(true);
        try {
            await CategoryApi(params, id, "PATCH");
            setCategoryResponse({ status: "success", detail: "Category edited successfully." });
            fetchCategories();
        } catch (err) {
            setCategoryError({ status: "error", detail: "Failed to edit category." });
            setCategoryResponse(null);
        } finally {
            setCategoryLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        setCategoryLoading(true);
        try {
            await CategoryApi(null, id, "DELETE");
            setCategoryResponse({ status: "success", detail: "Category deleted successfully." });
        } catch (err) {
            setCategoryError({ status: "error", detail: "Failed to delete category." });
            setCategoryResponse(null);
        } finally {
            setCategoryLoading(false);
        }
    };

    const refresh = () => fetchCategories();

    useEffect(() => {
        fetchCategories();
    }, []);

    return {
        categoryData,
        categoryResponse,
        categoryLoading,
        categoryError,
        fetchCategories,
        postCategory,
        patchCategory,
        deleteCategory,
        refresh
    };
}
