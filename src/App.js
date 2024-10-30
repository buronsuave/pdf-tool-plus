import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CardGrid from './components/CardGrid';
import './index.css';

const App = () => {
    const [cards, setCards] = useState([]);
    const [showClassSidebar, setShowClassSidebar] = useState("show");

    const addCard = (pdf) => {
        const newCard = { id: Date.now(), pdf };
        setCards([...cards, newCard]);
    };

    const removeCard = (id) => {
        setCards(cards.filter(card => card.id !== id));
    };

    const toggleSidebar = () => {
        setShowClassSidebar(!showClassSidebar);
    }

    return (
        <div className="app">
            <Navbar toggleSidebar={toggleSidebar} />
            {/* <Sidebar className={showClassSidebar ? "show" : ""} /> */}
            <main>
                <h1>PDF Tool</h1>
                <CardGrid cards={cards} addCard={addCard} removeCard={removeCard} />
            </main>
            <footer>David Alejandro Lopez Torres. 22310432</footer>
        </div>
    );
};

export default App;
