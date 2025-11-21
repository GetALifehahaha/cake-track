    import { useState, useEffect } from "react";
    import ProductApi from "../api/ProductApi";
    import { useParams, useSearchParams } from "react-router-dom";

    export default function useProduct({isArchived=false} = {}) {
        const [productResponse, setProductResponse] = useState();
        const [productData, setProductData] = useState([]);
        const [productLoading, setProductLoading] = useState(true);
        const [productError, setProductError] = useState(null);
        const [searchParams] = useSearchParams();
        const { product_id } = useParams();

        const fetchProducts = async () => {
            setProductLoading(true);
            try {
                const params = Object.fromEntries(searchParams.entries());
                const data = await ProductApi(params, product_id);
                setProductData(data);
            } catch (err) {
                setProductError({ status: "error", detail: "Failed to read product." });
            } finally {
                setProductLoading(false);
            }
        };

        const fetchArchivedProducts = async () => {
            setProductLoading(true);
            try {
                const params = Object.fromEntries(searchParams.entries());

                params.is_archived = true;

                const data = await ProductApi(params, product_id);
                setProductData(data);
            } catch (err) {
                setProductError({ status: "error", detail: "Failed to read product." });
            } finally {
                setProductLoading(false);
            }
        }

        const postProduct = async (params) => {

            setProductLoading(true);
            try {
                await ProductApi(params, null, "POST");
                setProductResponse({ status: "success", detail: "Product created successfully." });
            } catch (err) {
                setProductError({ status: "error", detail: "Failed to create product." });
                setProductResponse(null);
            } finally {
                setProductLoading(false);
            }
        };

        const patchProduct = async (id, params) => {
            setProductLoading(true);
            try {
                await ProductApi(params, id, "PATCH");
                setProductResponse({ status: "success", detail: "Product edited successfully." });
                fetchProducts();
            } catch (err) {
                setProductError({ status: "error", detail: "Failed to edit product." });
                setProductResponse(null);
            } finally {
                setProductLoading(false);
            }
        };

        const deleteProduct = async (id) => {
            setProductLoading(true);
            try {
                await ProductApi(null, id, "DELETE");
                setProductResponse({ status: "success", detail: "Product deleted successfully." });
            } catch (err) {
                setProductError({ status: "error", detail: "Failed to delete product." });
                setProductResponse(null);
            } finally {
                setProductLoading(false);
            }
        };

        const refresh = () => fetchProducts();

        useEffect(() => {
            if (isArchived) {
                fetchArchivedProducts()
            } else {
                fetchProducts();
            }
        }, [searchParams]);

        return {
            productData,
            productResponse,
            productLoading,
            productError,
            fetchProducts,
            postProduct,
            patchProduct,
            deleteProduct,
            refresh
        };
    }
