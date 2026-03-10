import api from "./api";

const LocationApi = {
    getAll: async () => {
        const response = await api.get('/addresses/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/addresses/${id}/`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/addresses/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.patch(`/addresses/${id}/`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/addresses/${id}/`);
        return response;
    },
};

export default LocationApi;
