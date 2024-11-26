import React, { useState } from 'react';
import {} from '../firebase';

const Card = ({ id, pdf, name, removeCard, updateCard }) => {
    const [editableName, setEditableName] = useState(name || '');
    const [isEditing, setIsEditing] = useState(false);

    const handleNameChange = (e) => {
        setEditableName(e.target.value);
    };

    const handleNameSave = () => {
        if (!updateCard(id, editableName)) {setEditableName(null)}
        setIsEditing(false);
    };

    return (
        <div className="card">
            <iframe src={pdf} title="Generated PDF" width="100%" height="600px"></iframe>
            <br></br>
            {isEditing ? (
                <input
                    type="text"
                    value={editableName}
                    onChange={handleNameChange}
                    onBlur={handleNameSave}
                    autoFocus
                />
            ) : (
                <h3 onClick={() => setIsEditing(true)}>{editableName || 'Unnamed PDF'}</h3>
            )}
            <button className='removeButton' onClick={() => removeCard(id)}>Remove</button>
        </div>
    );
};

export default Card;
