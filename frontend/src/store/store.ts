import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import worldReducer from "./worldSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        world: worldReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
