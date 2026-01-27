import api from "./api";
import { crudApi } from "./crudApi";

const baseApi = crudApi("pos/products");

export const ProductApi = {
    ...baseApi,

    fetchArchived: () => api.get("/pos/products?is_archived=True").then(res => res.data),
    batchUnarchive: (data) => api.post("/pos/products/unarchive/", data).then(res => res.data)
}
