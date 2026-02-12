import { configureStore } from '@reduxjs/toolkit';
import { customersApi } from '../features/customers/customersApi';
import { errorLoggerMiddleware } from './middleware/errorMiddleware';

export const store = configureStore({
    reducer: {
        // Тільки наш API редьюсер
        [customersApi.reducerPath]: customersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            customersApi.middleware,
            errorLoggerMiddleware
        ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;