import api from "./api";

export const crudApi = (resource) => ({
    fetchList: (params) => api.get(`/${resource}/`, params).then(res => res.data),

    fetchById: (id) => api.get(`/${resource}/${id}/`).then(res => res.data),

    create: (data) => api.post(`/${resource}/`, data).then(res => res.data),

    update: (id, data) => api.patch(`/${resource}/${id}/`, data).then(res => res.data),

    delete: (id) => api.delete(`/${resource}/${id}/`).then(res => res.data),
})