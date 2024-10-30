import { getDatabase, ref, set, get, child } from 'firebase/database'; 

const db = getDatabase(); // Initialize Realtime Database

// Sync workspace (create or update)
export const syncWorkspace = async (files) => {
    const workspaceName = "myworkspace"; // Create only one workspace

    try {
        const workspaceRef = ref(db, `workspaces/${workspaceName}`);

        const workspaceData = {
            workspaceName,
            createdAt: new Date().toISOString(),
            files: files.reduce((acc, file) => {
                acc[file.name] = {  // Changed to use file.name or file.id as key
                    documentName: file.name,
                    storageId: file.storageId,
                };
                return acc;
            }, {}),
        };

        // Update or create the workspace data in Realtime Database
        await set(workspaceRef, workspaceData);
        alert('Workspace synced successfully!');
    } catch (error) {
        console.error('Error syncing workspace:', error);
    }
};

// Check if a workspace exists
export const getWorkspace = async (workspaceName) => {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `workspaces/${workspaceName}`));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log('No such workspace found!');
            return null;
        }
    } catch (error) {
        console.error('Error fetching workspace:', error);
    }
};