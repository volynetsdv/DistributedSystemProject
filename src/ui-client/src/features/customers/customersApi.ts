import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Customer } from './models';

export const customersApi = createApi({
    reducerPath: 'customersApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        // Визначаємо запит. Назва ендпоїнту стане основою для хука.
        getTestCustomer: builder.query<Customer, void>({
            query: () => 'customers/test',
        }),
    }),
});

// Експортуємо авто-генерований хук
export const { useGetTestCustomerQuery } = customersApi;