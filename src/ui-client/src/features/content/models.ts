export interface ContentItem {
    id: number;
    title: string;
    body: string;
    externalId?: string;
    imageUrl?: string;
    createdAt: string;
}

export interface ContentItemCreate {
    title: string;
    body: string;
    externalId?: string;
}
