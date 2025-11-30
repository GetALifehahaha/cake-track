import api from "./api";

const CashierApi = async (params, id = null, method = "GET") => {
    try {
        if (method === "GET") {
            // 1. Get specific cashier/user details
            if (id) {
                const response = await api.get(`/users/${id}/`);
                return response.data;
            } 
            // 2. Get all users (with optional filters like ?group=cashier)
            else {
                // Pass params (e.g., { group: 'cashier' }) to the request
                const response = await api.get(`/users/`, { params });
                return response.data;
            }
        } 
        
        else if (method === "POST") {
            // Create a new user (Cashier)
            const response = await api.post(`/users/`, params);
            return response.data;
        } 
        
        else if (method === "PATCH") {
            // Update an existing user
            const response = await api.patch(`/users/${id}/`, params);
            return response.data;
        } 
        
        else if (method === "DELETE") {
            // Delete a user
            const response = await api.delete(`/users/${id}/`);
            return response;
        }

    } catch (err) {
        throw err;
    }
};

export default CashierApi;