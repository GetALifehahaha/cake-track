import api from "./api";

const SizeApi = async (params, id = null, method = "GET") => {
    try {
        if (method === "GET") {
            if (id) {
                const response = await api.get(`/pos/sizes/${id}/`);
                return response.data;
            }
            const response = await api.get(`/pos/sizes/`, { params });
            return response.data;
        } 
        
        else if (method === "POST") {
            const response = await api.post(`/pos/sizes/`, params);
            return response.data;
        } 
        
        else if (method === "PATCH") {
            const response = await api.patch(`/pos/sizes/${id}/`, params);
            return response.data;
        } 
        
        else if (method === "DELETE") {
            const response = await api.delete(`/pos/sizes/${id}/`);
            return response;
        }
    } catch (err) {
        throw err;
    }
};

export default SizeApi;
