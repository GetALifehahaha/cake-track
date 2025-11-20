import api from "./api";

const CategoryApi = async (params, id = null, method = "GET") => {
    try {
        if (method === "GET") {
            if (id) {
                const response = await api.get(`/pos/categories/${id}/`);
                return response.data;
            }
            const response = await api.get(`/pos/categories/`, { params });
            return response.data;
        } 
        
        else if (method === "POST") {
            const response = await api.post(`/pos/categories/`, params);
            return response.data;
        } 
        
        else if (method === "PATCH") {
            const response = await api.patch(`/pos/categories/${id}/`, params);
            return response.data;
        } 
        
        else if (method === "DELETE") {
            const response = await api.delete(`/pos/categories/${id}/`);
            return response;
        }
    } catch (err) {
        throw err;
    }
};

export default CategoryApi;
