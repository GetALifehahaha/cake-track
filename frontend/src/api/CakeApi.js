import api from "./api";
import { crudApi } from "./crudApi";

const baseApi = crudApi("orders/cakes");

export const CakeApi = {
    ...baseApi,
    fetchArchived: () => api.get("/orders/cakes?is_archived=True").then(res => res.data),
    batchUnarchive: (data) => api.post("/orders/cakes/unarchive/", data).then(res => res.data)
};