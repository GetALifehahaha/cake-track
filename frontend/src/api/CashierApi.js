// import api from "./api";
import { crudApi } from "./crudApi";
import api from "./api";

const baseApi = crudApi('users');

export const CashierApi = {
    ...baseApi,

    createCashier: (data) => api.post('/users/user/register/', data).then(res => res.data),
    getOtp: () => ('/api/'),
    activateAccount: (data) => api.post('/users/user/activate/', data).then(res => res.data),
}