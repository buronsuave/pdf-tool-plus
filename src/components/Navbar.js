import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Plus, RefreshCw, User, LogIn, LogOut } from 'lucide-react'; // Import icons
import './Navbar.css';

const Navbar = ({ 
    onSync, 
    user, 
    onLogin, 
    onLogout, 
    addCard, 
    workspaces, 
    onSelectWorkspace, 
    createWorkspace  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateWSOpen, setCreateWSOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [selectedWorkspace, setSelectedWorkspace] = useState(''); // Shared state for selected workspace

    const toggleSidebar = () => setIsOpen((prev) => !prev);
    const closeSidebar = () => setIsOpen(false);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const pdfUrl = URL.createObjectURL(file);
            addCard(pdfUrl);
        }
    };

    const handleCreateWorkspace = () => {
        if (newWorkspaceName.trim()) {
            createWorkspace(newWorkspaceName);
            setNewWorkspaceName('');
        } else {
            alert('Workspace name cannot be empty.');
        }
    };

    // Handle selection of workspace
    const handleWorkspaceChange = (workspaceId) => {
        setSelectedWorkspace(workspaceId); // Update local state
        onSelectWorkspace(workspaceId); // Notify parent component
    };

    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-brand">PDF Tool</div>

                {/* Workspace Selector */}
                {user && (
                    <div className="workspace-selector">
                        <select
                            className="workspace-dropdown"
                            value={selectedWorkspace}
                            onChange={(e) => handleWorkspaceChange(e.target.value)}
                        >
                            <option value="">Select Workspace</option>
                            {workspaces.map((workspace) => (
                                <option key={workspace.id} value={workspace.id}>
                                    {workspace.workspaceName}
                                </option>
                            ))}
                        </select>
                        <button
                            className="add-workspace-btn"
                            onClick={() => {
                                 setCreateWSOpen(true)
                                 setNewWorkspaceName('')}}
                        >
                            <Plus size={16} /> New
                        </button>
                    </div>
                )}

                {/* Links shown inline on large screens */}
                <div className="navbar-links">
                    <Link to="/" className="nav-link">
                        <Home size={16} /> Home
                    </Link>
                    <Link to="/search" className="nav-link">
                        <Search size={16} /> Search
                    </Link>
                    {user ? (
                        <>
                            <label htmlFor="fileUpload" className="nav-link upload-link">
                                <Plus size={16} /> Add PDF
                                <input 
                                    id="fileUpload" 
                                    type="file" 
                                    accept="application/pdf" 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileUpload} 
                                />
                            </label>
                            <Link className="nav-link" onClick={onSync}>
                                <RefreshCw size={16} /> Sync Workspace
                            </Link>
                            <span className="user-info">
                                <User size={16} /> Welcome, {user.displayName}
                            </span>
                            <Link className="nav-link logout" onClick={onLogout}>
                                <LogOut size={16} /> Logout
                            </Link>
                        </>
                    ) : (
                        <Link className="nav-link login" onClick={onLogin}>
                            <LogIn size={16} /> Login with Google
                        </Link>
                    )}
                </div>

                {/* Workspace Creation Modal */}
                {isCreateWSOpen && (
                    <div className="workspace-modal">
                        <input
                            type="text"
                            value={newWorkspaceName}
                            placeholder="Workspace Name"
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                        />
                        <button onClick={handleCreateWorkspace}>Create</button>
                        <button onClick={() => setCreateWSOpen(false)}>Cancel</button>
                    </div>
                )}

                {/* Toggle button for small screens */}
                <button className="toggle-button" onClick={toggleSidebar}>
                    ☰
                </button>
            </nav>

            {/* Sidebar for small screens */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <Link to="/" className="nav-link" onClick={closeSidebar}>
                    <Home size={16} /> Home
                </Link>
                <Link to="/search" className="nav-link" onClick={closeSidebar}>
                    <Search size={16} /> Search
                </Link>

                {/* Workspace Selector and Create Button */}
                {user && (
                    <div className="workspace-selector-sidebar">
                        <select
                            className="workspace-dropdown-sidebar"
                            value={selectedWorkspace}
                            onChange={(e) => handleWorkspaceChange(e.target.value)}
                        >
                            <option value="">Select Workspace</option>
                            {workspaces.map((workspace) => (
                                <option key={workspace.id} value={workspace.id}>
                                    {workspace.workspaceName}
                                </option>
                            ))}
                        </select>
                        <button
                            className="add-workspace-btn-sidebar"
                            onClick={() => {
                                setNewWorkspaceName('')
                                setCreateWSOpen(true);
                            }}
                        >
                            <Plus size={16} /> New Workspace
                        </button>
                    </div>
                )}

                {user ? (
                    <>
                        <label htmlFor="fileUploadSidebar" className="nav-link upload-link" onClick={closeSidebar}>
                            <Plus size={16} /> Add PDF
                            <input 
                                id="fileUploadSidebar" 
                                type="file" 
                                accept="application/pdf" 
                                style={{ display: 'none' }} 
                                onChange={handleFileUpload} 
                            />
                        </label>
                        <Link className="nav-link" onClick={() => { 
                            onSync(); 
                            closeSidebar(); 
                        }}>
                            <RefreshCw size={16} /> Sync Workspace
                        </Link>
                        <span className="user-info">
                            <User size={16} /> Welcome, {user.displayName}
                        </span>
                        <Link className="nav-link" onClick={() => {
                            onLogout();
                            closeSidebar();
                        }}>
                            <LogOut size={16} /> Logout
                        </Link>
                    </>
                ) : (
                    <Link className="nav-link" onClick={() => {
                        onLogin();
                        closeSidebar();
                    }}>
                        <LogIn size={16} /> Login with Google
                    </Link>
                )}
            </div>
        </>
    );
};

export default Navbar;
