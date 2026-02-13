// import api from "./api";
import { crudApi } from "./crudApi";
import api from "./api";

const baseApi = crudApi('users');

export const CashierApi = {
    ...baseApi,

    getOtp: () => ('/api/')
}