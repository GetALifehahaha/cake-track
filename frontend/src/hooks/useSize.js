import { useState, useEffect } from "react";
import SizeApi from "../api/SizeApi";
import { useParams, useSearchParams } from "react-router-dom";

export default function useSize() {
    const [sizeResponse, setSizeResponse] = useState();
    const [sizeData, setSizeData] = useState([]);
    const [sizeLoading, setSizeLoading] = useState(true);
    const [sizeError, setSizeError] = useState(null);

    const fetchSizes = async () => {
        setSizeLoading(true);
        try {
            const data = await SizeApi();
            setSizeData(data);
        } catch (err) {
            setSizeError({ status: "error", detail: "Failed to read size." });
        } finally {
            setSizeLoading(false);
        }
    };

    const postSize = async (params) => {
        setSizeLoading(true);
        try {
            await SizeApi(params, null, "POST");
            setSizeResponse({ status: "success", detail: "Size created successfully." });
        } catch (err) {
            setSizeError({ status: "error", detail: "Failed to create size." });
            setSizeResponse(null);
        } finally {
            setSizeLoading(false);
        }
    };

    const patchSize = async (id, params) => {
        setSizeLoading(true);
        try {
            await SizeApi(params, id, "PATCH");
            setSizeResponse({ status: "success", detail: "Size edited successfully." });
            fetchSizes();
        } catch (err) {
            setSizeError({ status: "error", detail: "Failed to edit size." });
            setSizeResponse(null);
        } finally {
            setSizeLoading(false);
        }
    };

    const deleteSize = async (id) => {
        setSizeLoading(true);
        try {
            await SizeApi(null, id, "DELETE");
            setSizeResponse({ status: "success", detail: "Size deleted successfully." });
        } catch (err) {
            setSizeError({ status: "error", detail: "Failed to delete size." });
            setSizeResponse(null);
        } finally {
            setSizeLoading(false);
        }
    };

    const refresh = () => fetchSizes();

    useEffect(() => {
        fetchSizes();
    }, []);

    return {
        sizeData,
        sizeResponse,
        sizeLoading,
        sizeError,
        fetchSizes,
        postSize,
        patchSize,
        deleteSize,
        refresh
    };
}
