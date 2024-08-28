export interface resource {
    name: string;
    description: string;
    url: string;
}

export interface article {
    id: string;
    title: string;
    description: string;
    lastModified: string;
    date: string;
    path: string;
}
export interface Metadata {
    title: string;
    description: string;
    date: string;
}