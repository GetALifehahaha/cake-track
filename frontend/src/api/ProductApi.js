import api from "./api";

const ProductApi = async (params, id = null, method = "GET") => {
    try {
        if (method === "GET") {
            if (id) {
                const response = await api.get(`/pos/products/${id}/`);
                return response.data;
            }
            const response = await api.get(`/pos/products/`, { params });
            return response.data;
        } 
        
        else if (method === "POST") {
            const response = await api.post(`/pos/products/`, params);
            return response.data;
        } 
        
        else if (method === "PATCH") {
            const response = await api.patch(`/pos/products/${id}/`, params);
            return response.data;
        } 
        
        else if (method === "DELETE") {
            const response = await api.delete(`/pos/products/${id}/`);
            return response;
        }
    } catch (err) {
        throw err;
    }
};

export default ProductApi;
