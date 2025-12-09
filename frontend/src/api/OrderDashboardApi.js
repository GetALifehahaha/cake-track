import api from "./api";

const OrderDashboardApi = async (params = {}) => {
    try {
        // Matches the 'path('dashboard/analytics/', ...)' from your Django views
        const response = await api.get('/orders/analytics/');
        return response.data;
    } catch (err) {
        throw err;
    }
};

export default OrderDashboardApi;