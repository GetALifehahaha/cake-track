import api from "./api";

const InventoryTransactionApi = async (params, id = null, method = "GET") => {
    try {
        if (method === "GET") {
            if (id) {
                const response = await api.get(`/inventory/transactions/${id}/`);
                return response.data;
            }
            const response = await api.get(`/inventory/transactions/`, { params });
            return response.data;
        } 
        
        else if (method === "POST") {
            const response = await api.post(`/inventory/transactions/`, params);
            return response.data;
        } 
        
        else if (method === "PATCH") {
            const response = await api.patch(`/inventory/transactions/${id}/`, params);
            return response.data;
        } 
        
        else if (method === "DELETE") {
            const response = await api.delete(`/inventory/transactions/${id}/`);
            return response;
        }
    } catch (err) {
        throw err;
    }
};

export default InventoryTransactionApi;
