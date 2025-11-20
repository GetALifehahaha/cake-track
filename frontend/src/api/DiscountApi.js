import api from "./api";

const DiscountApi = async (params, id = null, method = "GET") => {
    try {
        if (method === "GET") {
            if (id) {
                const response = await api.get(`/pos/discounts/${id}/`);
                return response.data;
            }
            const response = await api.get(`/pos/discounts/`, { params });
            return response.data;
        } 
        
        else if (method === "POST") {
            const response = await api.post(`/pos/discounts/`, params);
            return response.data;
        } 
        
        else if (method === "PATCH") {
            const response = await api.patch(`/pos/discounts/${id}/`, params);
            return response.data;
        } 
        
        else if (method === "DELETE") {
            const response = await api.delete(`/pos/discounts/${id}/`);
            return response;
        }
    } catch (err) {
        throw err;
    }
};

export default DiscountApi;
