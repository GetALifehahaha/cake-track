import { crudApi } from "./crudApi";

const baseApi = crudApi("pos/products");

export const ProductApi = {
    ...baseApi,

    fetchArchived: () => api.get("/pos/products?is_archived=True").then(res => res.data)
}
