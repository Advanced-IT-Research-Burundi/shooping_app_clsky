import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  tagTypes: ['Product'],
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
      // Provides tags for invalidation
      providesTags: (result) => 
        result
          ? [
              // Provides a specific tag for the List
              { type: 'Product', id: 'LIST' },
              // Optionally provide tags for each item if we want granular invalidation
              ...result.data.map(({ id }) => ({ type: 'Product', id })),
            ]
          : [{ type: 'Product', id: 'LIST' }],
      
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems) => {
        if (newItems.meta && newItems.meta.current_page === 1) {
            // If page 1, replace everything (fresh load or reset)
            currentCache.data = newItems.data;
            currentCache.meta = newItems.meta;
            currentCache.links = newItems.links;
        } else {
            // If loading more pages (or refetching a subsequent page), merge safely
            // We use a Map or Set to prevent duplicates if a page is refetched
            const existingIds = new Set(currentCache.data.map(p => p.id));
            const distinctNewItems = newItems.data.filter(p => !existingIds.has(p.id));
            
            currentCache.data.push(...distinctNewItems);
            currentCache.meta = newItems.meta;
            currentCache.links = newItems.links;
        }
      },
      // Refetch when the page arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: '/products',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const { useGetDataQuery, useGetProductsQuery, useAddProductMutation, useUpdateProductMutation } = apiSlice;
