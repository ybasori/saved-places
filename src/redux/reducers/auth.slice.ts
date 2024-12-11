import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IAuthData {
  name: string;
  token: string;
  expires: number;
}

interface IInitialState {
  authData: IAuthData | null;
}

const initialState: IInitialState = {
  authData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<IAuthData | null>) => {
      state.authData = action.payload;
    },
  },
});

export const { setAuth } = authSlice.actions;

export default authSlice.reducer;
