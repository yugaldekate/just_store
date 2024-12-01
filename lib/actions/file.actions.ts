"use server"

import { ID, Models, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import { GetFilesProps, UploadFileProps } from "@/types";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
};

export const uploadFile = async ({ file, ownerId, accountId, path }: UploadFileProps) => {
    const { storage, databases } = await createAdminClient();
  
    try {
        const inputFile = InputFile.fromBuffer(file, file.name);
    
        // upload file in appwrite storage bucket
        const bucketFile = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            inputFile,
        );
    
        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId,
            users: [],
            bucketFileId: bucketFile.$id,
        };
  
        // create a document in files table
        const newFile = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.filesCollectionId,
                ID.unique(),
                fileDocument,
            )
            .catch(async (error: unknown) => {
                await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
                handleError(error, "Failed to create file document");
            });
    
        revalidatePath(path);
        return parseStringify(newFile);
    } catch (error) {
        handleError(error, "Failed to upload file");
    }
};

const createQueries = ( currentUser: Models.Document, types: string[], searchText: string, sort: string, limit?: number ) => {
    const queries = [
        Query.or([
            Query.equal("owner", [currentUser.$id]),
            Query.contains("users", [currentUser.email]),
        ]),
    ];
  
    if (types.length > 0) queries.push(Query.equal("type", types));
    if (searchText) queries.push(Query.contains("name", searchText));
    if (limit) queries.push(Query.limit(limit));
  
    if (sort) {
        const [sortBy, orderBy] = sort.split("-");
    
        queries.push(
            orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
        );
    }
  
    return queries;
};

export const getFiles = async ({ types = [], searchText = "", sort = "$createdAt-desc", limit }: GetFilesProps) => {
    const { databases } = await createAdminClient();
  
    try {
        const currentUser = await getCurrentUser();
    
        if (!currentUser) throw new Error("User not found");
    
        const queries = createQueries(currentUser, types, searchText, sort, limit);
    
        const files = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            queries,
        );
    
        console.log({ files });
        return parseStringify(files);
    } catch (error) {
        handleError(error, "Failed to get files");
    }
};