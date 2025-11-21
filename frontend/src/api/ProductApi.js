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
            const formData = new FormData();
            
            for (const key in params) {
                formData.append(key, params[key]);
            }
            
            console.log(formData)
            
            const response = await api.post(`/pos/products/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        } 
        
        else if (method === "PATCH") {
            const hasImage = Object.values(params).some(value => value instanceof File)

            if (hasImage) {
                const formData = new FormData();

                for (const key in params) {
                    formData.append(key, params[key]);
                }


                const response = await api.patch(`/pos/products/`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                return response.data
                
            }
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
