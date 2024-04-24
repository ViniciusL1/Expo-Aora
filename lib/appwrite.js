import { Client, Account, ID, Avatars, Databases, Query } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora_crash',
    projectId: '6626d069e003eabb9c04',
    databaseId: '6626d2630bc507dc9264',
    userColletionId: '6626d290551b64bc97d1',
    videoColletionId: '6626d2c3c59e5a8ab7e5',
    storageId: '6626d542774b238ea34b',
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userColletionId,
    videoColletionId,
    storageId
} = appwriteConfig;


// Init your react-native SDK
const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteConfig.projectId) // Your project ID
    .setPlatform(appwriteConfig.platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username)

        if(!newAccount) throw Error

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId, 
            appwriteConfig.userColletionId, 
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            }
        );
        
        return newUser;

    } catch (error) {
        console.log(error);
        throw new Error(error)
    }
}

export const signIn = async (email, password) => {

    try {
        const session = await account.createEmailSession(email, password)
        return session;
    } catch (error) {
        throw new Error(error)
    }
}

export async function getCurrentUser() {
    try {
      const currentAccount = await account.get();
      if (!currentAccount) throw Error;
  
      const currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userColletionId,
        [Query.equal("accountId", currentAccount.$id)]
      );
  
      if (!currentUser) throw Error;
  
      return currentUser.documents[0];
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // Make de auto login work

export const getAllPosts = async () => {

    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoColletionId
        )
        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
}

export const getLatestPosts = async () => {

    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoColletionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        )
        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
}