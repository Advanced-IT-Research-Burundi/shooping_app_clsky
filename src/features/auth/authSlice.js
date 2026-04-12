import { createSlice } from '@reduxjs/toolkit';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

const initialState = {
  user: (() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      if (!u || u === 'undefined' || u === 'null') return null;
      return JSON.parse(u);
    } catch (e) {
      return null;
    }
  })(),
  token: (() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t || t === 'undefined' || t === 'null') return null;
    return t;
  })(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;
