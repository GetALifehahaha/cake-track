import { crudApi } from "./crudApi";

const baseApi = crudApi("orders/cakes");

export const CakeApi = {
    ...baseApi,
};
