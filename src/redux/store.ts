import { configureStore } from "@reduxjs/toolkit";
import { checkersReducer } from "../features/checkers/checkers.slice";

export const store = configureStore({
  reducer: { checkers: checkersReducer },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = typeof store.dispatch;
