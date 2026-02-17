import api from "./api";
import { crudApi } from "./crudApi";

const baseApi = crudApi('inventory/ingredients');

export const IngredientApi = {
    ...baseApi,

    fetchDashboard: () => api.get('/inventory/dashboard/').then(res => res.data)
}
