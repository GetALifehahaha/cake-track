import { useState, useEffect } from "react";
import TransactionApi from "../api/TransactionApi";
import { useParams, useSearchParams } from "react-router-dom";

export default function useTransaction() {
    const [transactionResponse, setTransactionResponse] = useState();
    const [transactionData, setTransactionData] = useState([]);
    const [transactionLoading, setTransactionLoading] = useState(true);
    const [transactionError, setTransactionError] = useState(null);
    const [searchParams] = useSearchParams();
    const { transaction_id } = useParams();

    const fetchTransactions = async () => {
        setTransactionLoading(true);
        try {
            const params = Object.fromEntries(searchParams.entries());
            const data = await TransactionApi(params, transaction_id);
            setTransactionData(data);
        } catch (err) {
            setTransactionError({ status: "error", detail: "Failed to read transaction." });
        } finally {
            setTransactionLoading(false);
        }
    };

    const postTransaction = async (params) => {
        setTransactionLoading(true);
        try {
            await TransactionApi(params, null, "POST");
            setTransactionResponse({ status: "success", detail: "Transaction created successfully." });
        } catch (err) {
            setTransactionError({ status: "error", detail: "Failed to create transaction." });
            setTransactionResponse(null);
        } finally {
            setTransactionLoading(false);
        }
    };

    const patchTransaction = async (id, params) => {
        setTransactionLoading(true);
        try {
            await TransactionApi(params, id, "PATCH");
            setTransactionResponse({ status: "success", detail: "Transaction edited successfully." });
            fetchTransactions();
        } catch (err) {
            setTransactionError({ status: "error", detail: "Failed to edit transaction." });
            setTransactionResponse(null);
        } finally {
            setTransactionLoading(false);
        }
    };

    const deleteTransaction = async (id) => {
        setTransactionLoading(true);
        try {
            await TransactionApi(null, id, "DELETE");
            setTransactionResponse({ status: "success", detail: "Transaction deleted successfully." });
        } catch (err) {
            setTransactionError({ status: "error", detail: "Failed to delete transaction." });
            setTransactionResponse(null);
        } finally {
            setTransactionLoading(false);
        }
    };

    const refresh = () => fetchTransactions();

    useEffect(() => {
        fetchTransactions();
    }, [searchParams]);

    return {
        transactionData,
        transactionResponse,
        transactionLoading,
        transactionError,
        fetchTransactions,
        postTransaction,
        patchTransaction,
        deleteTransaction,
        refresh
    };
}
