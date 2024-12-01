export interface UploadFileProps {
    file: File;
    ownerId: string;
    accountId: string;
    path: string;
}

export interface SearchParamProps {
    params?: Promise<{type : string}>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface GetFilesProps {
    types: FileType[];
    searchText?: string;
    sort?: string;
    limit?: number;
}