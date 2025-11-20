import api from "./api";

const TransactionApi = async (params, id = null, method = "GET") => {
    try {
        if (method === "GET") {
            if (id) {
                const response = await api.get(`/pos/transactions/${id}/`);
                return response.data;
            }
            const response = await api.get(`/pos/transactions/`, { params });
            return response.data;
        } 
        
        else if (method === "POST") {
            const response = await api.post(`/pos/transactions/`, params);
            return response.data;
        } 
        
        else if (method === "PATCH") {
            const response = await api.patch(`/pos/transactions/${id}/`, params);
            return response.data;
        } 
        
        else if (method === "DELETE") {
            const response = await api.delete(`/pos/transactions/${id}/`);
            return response;
        }
    } catch (err) {
        throw err;
    }
};

export default TransactionApi;
