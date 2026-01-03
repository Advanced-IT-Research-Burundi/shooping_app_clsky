import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_URL || 'http://localhost/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getData: builder.query({
      query: (endpoint = '/data') => endpoint,
    }),
    getProducts: builder.query({
      query: (page = 1) => `/products?page=${page}`,
      // Only have one cache entry because the arg always maps to one 'Products' list
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        // If the incoming page is 1, strictly replacing might be safer to handle "refresh" logic from the UI side,
        // but typically standard infinite scroll just appends. 
        // We will assume the user handles a "reset" by using a different approach or we just append.
        // However, checking if meta.current_page === 1 is a good safeguard to replace instead of append.
        if (newItems.meta && newItems.meta.current_page === 1) {
            currentCache.data = newItems.data;
            currentCache.meta = newItems.meta;
            currentCache.links = newItems.links;
        } else {
            currentCache.data.push(...newItems.data);
            currentCache.meta = newItems.meta;
            currentCache.links = newItems.links;
        }
      },
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
  }),
});

export const { useGetDataQuery, useGetProductsQuery } = apiSlice;
