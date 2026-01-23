import { crudApi } from "./crudApi";
import api from "./api";

const baseApi = crudApi("orders")

export const OrdersApi = {
    ...baseApi,

    batchUpdate: (data) => api.post(`/orders/batch-update/`, data).then(res => res.data),
}