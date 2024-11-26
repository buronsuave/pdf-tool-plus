import { getDatabase, ref, set, get, child, update } from 'firebase/database';

const db = getDatabase(); // Initialize Realtime Database

/**
 * Load all workspaces accessible to a user
 * @param {string} userEmail - The email of the user
 * @returns {Array<Object>} - List of workspaces the user has access to
 */
export const getUserWorkspaces = async (userEmail) => {
    try {
        const dbRef = ref(db, 'workspaces');
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const workspaces = snapshot.val();
            const accessibleWorkspaces = [];

            Object.entries(workspaces).forEach(([workspaceName, workspaceData]) => {
                const { accessControl } = workspaceData;
                const normalizedEmail = userEmail.replace('.', ','); // Normalize email for Firebase keys

                if (
                    accessControl &&
                    (accessControl.owner === userEmail ||
                        (accessControl.users && accessControl.users[normalizedEmail]))
                ) {
                    accessibleWorkspaces.push({ workspaceName, ...workspaceData });
                }
            });

            return accessibleWorkspaces;
        } else {
            console.log('No workspaces found!');
            return [];
        }
    } catch (error) {
        console.error('Error loading user workspaces:', error);
        return [];
    }
};

/**
 * Sync workspace (create or update)
 * @param {string} workspaceName - The name of the workspace
 * @param {Array} files - List of files to be synced
 * @param {string} ownerEmail - The owner's email
 * @param {Array<string>} users - List of user emails with access
 */
export const syncWorkspace = async (workspaceName, files, ownerEmail, users) => {
    try {
        console.log(workspaceName);
        const workspaceRef = ref(db, `workspaces/${workspaceName}`);
        
        const formattedUsers = users.reduce((acc, userEmail) => {
            acc[userEmail.replace('.', ',')] = true; // Convert email for Firebase keys
            return acc;
        }, {});

        const workspaceData = {
            workspaceName,
            createdAt: new Date().toISOString(),
            accessControl: {
                owner: ownerEmail,
                users: formattedUsers,
            },
            files: files.reduce((acc, file) => {
                acc[file.name] = {
                    documentName: file.name,
                    storageId: file.storageId,
                };
                return acc;
            }, {}),
        };

        // Update or create the workspace data in Realtime Database
        await set(workspaceRef, workspaceData);
        console.log('Workspace synced successfully!');
    } catch (error) {
        console.error('Error syncing workspace:', error);
    }
};

/**
 * Get workspace data
 * @param {string} workspaceName - The name of the workspace
 * @returns {Object|null} - Workspace data or null if not found
 */
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

/**
 * Add a user to a workspace
 * @param {string} workspaceName - The name of the workspace
 * @param {string} userEmail - The email of the user to add
 */
export const addUserToWorkspace = async (workspaceName, userEmail) => {
    try {
        const userKey = userEmail.replace('.', ',');
        const userRef = ref(db, `workspaces/${workspaceName}/accessControl/users/${userKey}`);
        await set(userRef, true);
        console.log(`User ${userEmail} added to workspace ${workspaceName}!`);
    } catch (error) {
        console.error('Error adding user to workspace:', error);
    }
};

/**
 * Remove a user from a workspace
 * @param {string} workspaceName - The name of the workspace
 * @param {string} userEmail - The email of the user to remove
 */
export const removeUserFromWorkspace = async (workspaceName, userEmail) => {
    try {
        const userKey = userEmail.replace('.', ',');
        const userRef = ref(db, `workspaces/${workspaceName}/accessControl/users/${userKey}`);
        await set(userRef, null); // Setting to null removes the node
        console.log(`User ${userEmail} removed from workspace ${workspaceName}!`);
    } catch (error) {
        console.error('Error removing user from workspace:', error);
    }
};

/**
 * Update files in a workspace
 * @param {string} workspaceName - The name of the workspace
 * @param {Array} files - List of files to update
 */
export const updateWorkspaceFiles = async (workspaceName, files) => {
    try {
        const filesRef = ref(db, `workspaces/${workspaceName}/files`);
        const updatedFiles = files.reduce((acc, file) => {
            acc[file.name] = {
                documentName: file.name,
                storageId: file.storageId,
            };
            return acc;
        }, {});

        await update(filesRef, updatedFiles);
        console.log('Workspace files updated successfully!');
    } catch (error) {
        console.error('Error updating workspace files:', error);
    }
};

/**
 * Create a new workspace
 * @param {string} workspaceName - The name of the workspace to create
 * @param {string} ownerEmail - The email of the workspace owner
 * @param {Array<string>} userEmails - List of emails for users to grant access
 * @param {Array<Object>} initialFiles - Array of file objects to initialize the workspace
 * @returns {Promise<void>} - Resolves when the workspace is successfully created
 */
export const createWorkspace = async (workspaceName, ownerEmail, userEmails = [], initialFiles = []) => {
    try {
        const workspaceRef = ref(db, `workspaces/${workspaceName}`);
        const normalizedEmails = userEmails.reduce((acc, email) => {
            const normalizedEmail = email.replace('.', ','); // Normalize email for Firebase keys
            acc[normalizedEmail] = true; // Use a simple boolean to indicate access
            return acc;
        }, {});

        const workspaceData = {
            workspaceName,
            createdAt: new Date().toISOString(),
            accessControl: {
                owner: ownerEmail,
                users: normalizedEmails,
            },
            files: initialFiles.reduce((acc, file) => {
                acc[file.name] = { // Use file name as the key
                    documentName: file.name,
                    storageId: file.storageId,
                };
                return acc;
            }, {}),
        };

        await set(workspaceRef, workspaceData);
        console.log(`Workspace "${workspaceName}" created successfully!`);
    } catch (error) {
        console.error('Error creating workspace:', error);
    }
};

