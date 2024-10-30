import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ cards, onSync }) => {
    return (
        <nav className="navbar">
            <Link to="/" className="nav-link">PDF Tool</Link>
            <Link to="/search" className="nav-link">Search</Link>
            <button onClick={onSync}>Sync Workspace</button>
        </nav>
    );
};

export default Navbar;

