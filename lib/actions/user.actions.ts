"use server"

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";

const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();
  
    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])],
    );
  
    return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();
  
    try {
        const session = await account.createEmailToken(ID.unique(), email); // send email and create an unique account in appwrite if not exist
        
        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send email OTP");
    }
};

export const createAccount = async ({ fullName, email }: { fullName: string, email: string }) => {
    const existingUser = await getUserByEmail(email);
  
    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Failed to send an OTP");
  
    if (!existingUser) {
        const { databases } = await createAdminClient();
    
        await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.usersCollectionId,
                ID.unique(),
                {
                    fullName,
                    email,
                    avatar: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
                    accountId,
                },
        );
    }
  
    return parseStringify({ accountId });
};

export const verifySecret = async ({ accountId, otp }: { accountId: string, otp: string }) => {
    try {
        const { account } = await createAdminClient();
    
        const session = await account.createSession(accountId, otp); // automatic OTP verification by appwrite
    
        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
    
        return parseStringify({ sessionId: session.$id });
    } catch (error) {
        handleError(error, "Failed to verify OTP");
    }
};