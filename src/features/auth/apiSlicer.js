import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_URL || 'http://localhost/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  tagTypes: ['Product', 'User', 'Container'],
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getData: builder.query({
      query: (endpoint = '/data') => endpoint,
    }),
    getProducts: builder.query({
      query: ({ page = 1, archived = false } = {}) => `/products?page=${page}${archived ? '&archived=1' : ''}`,
      // Distinct cache entries for active vs archived products
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const archived = queryArgs?.archived ? 'archived' : 'active';
        return `${endpointName}-${archived}`;
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
    archiveProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}/archive`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id }, 
        { type: 'Product', id: 'LIST' },
        { type: 'Container', id: 'LIST' }
      ],
    }),
    unarchiveProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/unarchive`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id }, 
        { type: 'Product', id: 'LIST' },
        { type: 'Container', id: 'LIST' }
      ],
    }),
    bulkArchiveProducts: builder.mutation({
      query: ({ ids, data }) => ({
        url: '/products/bulk-archive',
        method: 'POST',
        body: { ids, ...data },
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Container', id: 'LIST' }],
    }),
    bulkUnarchiveProducts: builder.mutation({
      query: (ids) => ({
        url: '/products/bulk-unarchive',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Container', id: 'LIST' }],
    }),
    bulkDeleteProducts: builder.mutation({
      query: (ids) => ({
        url: '/products/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Container', id: 'LIST' }],
    }),
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/update-profile',
        method: 'PUT',
        body: data,
      }),
    }),
    addUser: builder.mutation({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateUserData: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getContainers: builder.query({
      query: () => '/containers',
      providesTags: (result) => 
        result 
          ? [...result.map(({ id }) => ({ type: 'Container', id })), { type: 'Container', id: 'LIST' }]
          : [{ type: 'Container', id: 'LIST' }],
    }),
    getContainerProducts: builder.query({
      query: (id) => `/containers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Container', id }],
    }),
    getDevises: builder.query({
      query: () => "/devises",
    }),
    getSuppliers: builder.query({
      query: () => "/suppliers",
      transformResponse: (response) => response.data || response,
    }),
    getReports: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append("start_date", params.start_date);
        if (params.end_date) queryParams.append("end_date", params.end_date);
        if (params.supplier_id) queryParams.append("supplier_id", params.supplier_id);
        if (params.container_id) queryParams.append("container_id", params.container_id);
        if (params.category_id) queryParams.append("category_id", params.category_id);
        
        const queryString = queryParams.toString();
        return queryString ? `/product_reportss?${queryString}` : "/product_reportss";
      },
      transformResponse: (response) => {
        // Ensure we always return an array
        if (response && response.data && Array.isArray(response.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: ["Product"],
    }),
  }),
});

export const { 
  useGetDataQuery, 
  useGetProductsQuery, 
  useAddProductMutation, 
  useUpdateProductMutation,
  useArchiveProductMutation,
  useUnarchiveProductMutation,
  useBulkArchiveProductsMutation,
  useBulkUnarchiveProductsMutation,
  useBulkDeleteProductsMutation,
  useGetUsersQuery,
  useUpdateProfileMutation,
  useAddUserMutation,
  useUpdateUserDataMutation,
  useGetContainersQuery,
  useGetContainerProductsQuery,
  useGetDevisesQuery,
  useGetSuppliersQuery,
  useGetReportsQuery,
} = apiSlice;
