import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onSync }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen((prev) => !prev);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-brand">PDF Tool</div>

                {/* Links shown inline on large screens */}
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/search" className="nav-link">Search</Link>
                    <button className="sync-button" onClick={onSync}>Sync Workspace</button>
                </div>

                {/* Toggle button for small screens */}
                <button className="toggle-button" onClick={toggleSidebar}>
                    ☰
                </button>
            </nav>

            {/* Sidebar for small screens */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <Link to="/" className="nav-link" onClick={closeSidebar}>Home</Link>
                <Link to="/search" className="nav-link" onClick={closeSidebar}>Search</Link>
                <button className="sync-button" onClick={() => { 
                    onSync(); 
                    closeSidebar(); 
                }}>Sync Workspace</button>
            </div>

            {/* Overlay to close the sidebar when clicked */}
            {isOpen && <div className="overlay" onClick={closeSidebar}></div>}
        </>
    );
};

export default Navbar;
