import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CardGrid from './components/CardGrid';
import Search from './components/Search';
import Navbar from './components/Navbar';
import './index.css';
import { getWorkspace, syncWorkspace } from './realtimeDB';
import { storage } from './firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { getPdfUrl } from './utils'; 

const App = () => {
    const [cards, setCards] = useState([]);

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
                console.log(loadedCards)
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

        console.log(cards)
        return true;
    };

    const uploadToFirestore = async (pdf, id) => {
        const blob = await fetch(pdf).then(res => res.blob());
        const storageRef = ref(storage, `pdfs/${id}.pdf`); // Consistent naming with ID

        try {
            await uploadBytes(storageRef, blob);
            alert('PDF uploaded successfully!');
            return `pdfs/${id}.pdf`; // Return the storage ID
        } catch (error) {
            console.error('Error uploading PDF: ', error);
            throw error;
        }
    };

    const handleSync = async () => {
        try {
            const files = await Promise.all(
                cards.map(async (card) => {
                    const storageId = await uploadToFirestore(card.pdf, card.id); // Upload each PDF
                    return {
                        name: card.name,
                        storageId: storageId,
                    };
                })
            );
            
            console.log(files);
            await syncWorkspace(files); // Now sync the workspace with uploaded files
        } catch (error) {
            console.error('Error during syncing:', error);
        }
    };

    return (
        <Router>
            <div className="app">
                <Navbar cards={cards} onSync={handleSync} /> {/* Pass handleSync as prop */}
                <main>
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                <CardGrid 
                                    cards={cards} 
                                    addCard={addCard} 
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
