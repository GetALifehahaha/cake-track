import { useState, useEffect } from "react";
import DiscountApi from "../api/DiscountApi";
import { useParams, useSearchParams } from "react-router-dom";

export default function useDiscount() {
    const [discountResponse, setDiscountResponse] = useState();
    const [discountData, setDiscountData] = useState([]);
    const [discountLoading, setDiscountLoading] = useState(true);
    const [discountError, setDiscountError] = useState(null);

    const fetchDiscounts = async () => {
        setDiscountLoading(true);
        try {
            const data = await DiscountApi();
            setDiscountData(data);
        } catch (err) {
            setDiscountError({ status: "error", detail: "Failed to read discount." });
        } finally {
            setDiscountLoading(false);
        }
    };

    const postDiscount = async (params) => {
        setDiscountLoading(true);
        try {
            await DiscountApi(params, null, "POST");
            setDiscountResponse({ status: "success", detail: "Discount created successfully." });
        } catch (err) {
            setDiscountError({ status: "error", detail: "Failed to create discount." });
            setDiscountResponse(null);
        } finally {
            setDiscountLoading(false);
        }
    };

    const patchDiscount = async (id, params) => {
        setDiscountLoading(true);
        try {
            await DiscountApi(params, id, "PATCH");
            setDiscountResponse({ status: "success", detail: "Discount edited successfully." });
            fetchDiscounts();
        } catch (err) {
            setDiscountError({ status: "error", detail: "Failed to edit discount." });
            setDiscountResponse(null);
        } finally {
            setDiscountLoading(false);
        }
    };

    const deleteDiscount = async (id) => {
        setDiscountLoading(true);
        try {
            await DiscountApi(null, id, "DELETE");
            setDiscountResponse({ status: "success", detail: "Discount deleted successfully." });
        } catch (err) {
            setDiscountError({ status: "error", detail: "Failed to delete discount." });
            setDiscountResponse(null);
        } finally {
            setDiscountLoading(false);
        }
    };

    const refresh = () => fetchDiscounts();

    useEffect(() => {
        fetchDiscounts();
    }, []);

    return {
        discountData,
        discountResponse,
        discountLoading,
        discountError,
        fetchDiscounts,
        postDiscount,
        patchDiscount,
        deleteDiscount,
        refresh
    };
}
