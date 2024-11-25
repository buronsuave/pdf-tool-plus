import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CardGrid from './components/CardGrid';
import Search from './components/Search';
import Navbar from './components/Navbar';
import './index.css';
import { getWorkspace, syncWorkspace } from './realtimeDB';
import { storage } from './firebase';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { getPdfUrl } from './utils'; 
import { auth } from './firebase';
import { signInWithGoogle, logOut } from './authUtils';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
    const [cards, setCards] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            alert(`Welcome, ${user.displayName}!`);
        } catch (error) {
            alert('Error logging in. Please try again.');
        }
    };

    const handleLogout = async () => {
        try {
            await logOut();
            alert('You have been logged out.');
        } catch (error) {
            alert('Error logging out. Please try again.');
        }
    };

    useEffect(() => {
        const loadWorkspace = async () => {
            const workspace = await getWorkspace('myworkspace');
            if (workspace && workspace.files) {
                const loadedCards = Object.entries(workspace.files).map(
                    ([name, data]) => ({
                        id: Date.now() + Math.random(),
                        pdf: getPdfUrl(data.storageId),
                        name: data.documentName,
                    })
                );
                setCards(loadedCards);
            }
        };
        loadWorkspace();
    }, []);

    const addCard = (pdf) => {
        const newId = Date.now()
        const newCard = { id: newId, pdf, name: '' };
        setCards([...cards, newCard]);
        return newId
    };

    const removeCard = (id) => {
        setCards(cards.filter(card => card.id !== id));
    };

    const updateCard = (id, newName) => {
        console.log(id, newName);

        if (cards.some(card => card.name === newName)) {
            alert('Document name must be unique!');
            return false;
        }
        setCards(cards.map(card =>
            card.id === id ? { ...card, name: newName } : card
        ));

        return true;
    };

    const uploadToFirestore = async (pdf, id) => {
        const blob = await fetch(pdf).then(res => res.blob());
        const storageRef = ref(storage, `pdfs/${id}.pdf`); // Consistent naming with ID

        try {
            await uploadBytes(storageRef, blob);
            console.log('PDF uploaded successfully!');
            return `pdfs/${id}.pdf`; // Return the storage ID
        } catch (error) {
            console.error('Error uploading PDF: ', error);
            throw error;
        }
    };

    const handleSync = async () => {
        try {
            // Fetch the existing workspace data
            const workspace = await getWorkspace('myworkspace');
            const existingFiles = workspace && workspace.files ? workspace.files : {};
            const files = [];
            const removedFiles = [];
    
            // Build a set of existing file names for quick lookup
            const existingNames = new Set(Object.keys(existingFiles));
    
            // First, handle the new files and updates
            for (const card of cards) {
                if (card.name) {
                    if (!existingNames.has(card.name)) {
                        // This is a new file, upload it
                        const storageId = await uploadToFirestore(card.pdf, card.id); // Upload each PDF
                        files.push({
                            name: card.name,
                            storageId: storageId,
                        });
                    } else {
                        // Existing file, keep it in the files list
                        files.push({
                            name: card.name,
                            storageId: existingFiles[card.name].storageId, // Retain the existing storageId
                        });
                    }
                }
            }
    
            // Identify removed files by checking existing files against local cards
            for (const name in existingFiles) {
                if (!cards.some(card => card.name === name)) {
                    // If the name is not found in local cards, mark it for removal
                    removedFiles.push(name);
                }
            }
    
            // Sync the workspace with the updated files list
            await syncWorkspace(files);
    
            // Now, remove any files that are no longer present locally
            await Promise.all(removedFiles.map(async (fileName) => {
                const storageId = existingFiles[fileName].storageId;
                const storageRef = ref(storage, storageId);
                await deleteObject(storageRef); // Remove from Firebase Storage
            }));
    
            alert('Workspace synced successfully!');
        } catch (error) {
            alert('Error during syncing:', error);
        }
    };    

    return (
        <Router>
            <div className="app">
                <Navbar 
                    cards={cards} 
                    onSync={handleSync} 
                    user={user}
                    onLogin={handleLogin}
                    onLogout={handleLogout} 
                    addCard={addCard}
                /> 
                <main>
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                <CardGrid 
                                    cards={cards}  
                                    removeCard={removeCard} 
                                    updateCard={updateCard} 
                                />
                            } 
                        />
                        <Route 
                            path="/search" 
                            element={
                                <Search 
                                    cards={cards}
                                    addCard={addCard} 
                                    removeCard={removeCard}
                                    updateCard={updateCard} 
                                />
                            } 
                        />
                    </Routes>
                </main>
                <footer>David Alejandro Lopez Torres. 22310432</footer>
            </div>
        </Router>
    );
};

export default App;
