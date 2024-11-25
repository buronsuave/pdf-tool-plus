import { auth, GoogleAuthProvider, signInWithPopup, signOut } from "./firebase";

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user; // Returns the authenticated user
    } catch (error) {
        console.error("Error during sign-in:", error);
        throw error;
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error during sign-out:", error);
        throw error;
    }
};
