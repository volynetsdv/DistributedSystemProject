import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';

export const errorLoggerMiddleware: Middleware = () => (next) => (action) => {
    // Перевіряємо, чи це екшен від RTK Query, який завершився помилкою
    if (isRejectedWithValue(action)) {
        console.error('API Error:', action.payload);
        // TODO додати пізніше dispatch(showBanner())
    }

    return next(action);
};