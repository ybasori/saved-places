import { configureStore, Middleware } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth.slice";

const logger: Middleware =
  ({ getState }) =>
  (next) =>
  (action) => {
    console.log("will dispatch", action);
    const returnValue = next(action);
    console.log("state after dispatch", getState());
    return returnValue;
  };

const storeAuthToLocalstorage: Middleware = () => (next) => (action) => {
  const knownAction = action as { type: string; payload: unknown };
  if ((knownAction.type as unknown as string) === "auth/setAuth") {
    localStorage.setItem("auth", JSON.stringify(knownAction.payload));
  }
  return next(action);
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger).concat(storeAuthToLocalstorage),
  preloadedState: {
    auth: {
      authData: (() => {
        const auth = JSON.parse(localStorage.getItem("auth") ?? "null");
        if (!!auth) {
          const diff = auth.expires * 1000 - new Date().getTime();
          if (diff <= 0) {
            return null;
          }
        }
        return auth;
      })(),
    },
  },
});
