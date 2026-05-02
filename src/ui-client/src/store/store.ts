import { configureStore } from '@reduxjs/toolkit';
import { customersApi } from '../features/customers/customersApi';
import { contentApi } from '../features/content/contentApi';
import { errorLoggerMiddleware } from './middleware/errorMiddleware';

export const store = configureStore({
    reducer: {
        [customersApi.reducerPath]: customersApi.reducer,
        [contentApi.reducerPath]: contentApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            customersApi.middleware,
            contentApi.middleware,
            errorLoggerMiddleware
        ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
