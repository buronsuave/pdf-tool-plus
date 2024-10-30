import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

const Card = ({ id, pdf, removeCard }) => {
    return (
        <div className="card">
            <iframe src={pdf} width="100%" height="400px" title="PDF Viewer"></iframe>
            <button className="removeButton" onClick={() => removeCard(id)}>
                <FiTrash2 /> Remove
            </button>
        </div>
    );
};

export default Card;