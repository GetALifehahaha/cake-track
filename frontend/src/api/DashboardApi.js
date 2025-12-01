import api from "./api";

const DashboardApi = async (params = {}) => {
    try {
        // Matches the 'path('dashboard/analytics/', ...)' from your Django views
        const response = await api.get('/pos/analytics/', { params });
        return response.data;
    } catch (err) {
        throw err;
    }
};

export default DashboardApi;