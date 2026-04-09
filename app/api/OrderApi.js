    import api from "./api";

    const fetchAllPages = async (url, params = {}) => {
        let nextUrl = url;
        let mergedResults = [];
        let requestParams = { ...params };

        while (nextUrl) {
            const response = await api.get(nextUrl, { params: requestParams });
            const payload = response.data;

            if (Array.isArray(payload)) {
                mergedResults = mergedResults.concat(payload);
                break;
            }

            if (Array.isArray(payload?.results)) {
                mergedResults = mergedResults.concat(payload.results);
                nextUrl = payload.next || null;
                requestParams = {};
                continue;
            }

            break;
        }

        return mergedResults;
    };

    const OrdersApi = async (params, id = null, method = "GET") => {
        try {
            if (method === "GET") {
                // 1. Get specific order details
                if (id) {
                    const response = await api.get(`/orders/orders/${id}/`);
                    return response.data;
                } 
                // 2. Get all orders (Standard list)
                else if (params) {
                    // Note: Standard ViewSets use the base URL. 
                    // If you implemented a specific 'orders-all' endpoint, change this URL.
                    const response = await api.get(`/orders/orders/`, { params });
                    console.log(params)
                    return response.data;
                }
                // 3. Get orders with filters/pagination params
                const response = await api.get(`/orders/orders/`);
                return response.data;
            } 

            else if (method === "GET_ALL_PAGES") {
                return fetchAllPages('/orders/orders/', params || {});
            }

            else if (method === "GET_HIDDEN_ALL_PAGES") {
                return fetchAllPages('/orders/orders/hidden/', params || {});
            }
            
            else if (method === "POST") {
                // This handles the "One Request" creation (Order + Cake + Cupcake)
                const response = await api.post(`/orders/orders/`, params);
                return response.data;
            } 
            
            else if (method === "PATCH") {
                const response = await api.patch(`/orders/orders/${id}/`, params);
                return response.data;
            } 
            
            else if (method === "DELETE") {
                const response = await api.delete(`/orders/orders/${id}/`);
                return response;
            }

            else if (method === "HIDE") {
                const response = await api.post(`/orders/orders/${id}/hide/`);
                return response.data;
            }
        } catch (err) {
            throw err;
        }
    };

    export default OrdersApi;