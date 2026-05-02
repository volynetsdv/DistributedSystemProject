import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ContentItem, ContentItemCreate } from './models';

export const contentApi = createApi({
    reducerPath: 'contentApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Content'],
    endpoints: (builder) => ({
        getContent: builder.query<ContentItem[], void>({
            query: () => 'content',
            providesTags: ['Content'],
        }),

        createContent: builder.mutation<ContentItem, ContentItemCreate>({
            query: (body) => ({ url: 'content', method: 'POST', body }),
            invalidatesTags: ['Content'],
        }),

        updateContent: builder.mutation<void, ContentItem>({
            query: (item) => ({
                url: `content/${item.id}`,
                method: 'PUT',
                body: item,
            }),
            invalidatesTags: ['Content'],
        }),

        deleteContent: builder.mutation<void, number>({
            query: (id) => ({ url: `content/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Content'],
        }),

        uploadImage: builder.mutation<{ imageUrl: string }, { id: number; file: File }>({
            query: ({ id, file }) => {
                const formData = new FormData();
                formData.append('file', file);
                return { url: `content/${id}/image`, method: 'POST', body: formData };
            },
            invalidatesTags: ['Content'],
        }),
    }),
});

export const {
    useGetContentQuery,
    useCreateContentMutation,
    useUpdateContentMutation,
    useDeleteContentMutation,
    useUploadImageMutation,
} = contentApi;
