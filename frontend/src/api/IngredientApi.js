import api from "./api";

const Ingredient = async (params, id = null, all=false, method = "GET") => {
    try {
        if (method === "GET") {
            if (id) {
                const response = await api.get(`/inventory/ingredients/${id}/`);
                return response.data;
            } else if (all) {
                const response = await api.get(`/inventory/ingredients-all/`);
                return response.data;
            }
            const response = await api.get(`/inventory/ingredients/`, { params });
            return response.data;
        } 
        
        else if (method === "POST") {
            const response = await api.post(`/inventory/ingredients/`, params);
            return response.data;
        } 
        
        else if (method === "PATCH") {
            const response = await api.patch(`/inventory/ingredients/${id}/`, params);
            return response.data;
        } 
        
        else if (method === "DELETE") {
            const response = await api.delete(`/inventory/ingredients/${id}/`);
            return response;
        }
    } catch (err) {
        throw err;
    }
};

export default Ingredient;
