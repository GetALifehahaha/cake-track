import { crudApi } from "./crudApi";

const baseApi = crudApi("orders")

export const OrdersApi = {
    ...baseApi,

    batchUpdate: (data) => api.post("/orders/batch-update").then(res => res.data)
}