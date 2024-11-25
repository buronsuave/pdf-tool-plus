// import React from 'react';
// import Card from './Card';

// const CardGrid = ({ cards, addCard, removeCard, updateCard }) => {
//     const handleFileUpload = (event) => {
//         const file = event.target.files[0];
//         if (file) {
//             const pdfUrl = URL.createObjectURL(file);
//             addCard(pdfUrl);
//         }
//     };

//     return (
//         <div className="grid-container">
//             {cards.map((card) => (
//                 <Card 
//                     key={card.id} 
//                     id={card.id} 
//                     pdf={card.pdf} 
//                     name={card.name} 
//                     removeCard={removeCard} 
//                     updateCard={updateCard} 
//                 />
//             ))}
//             <div className="card placeholder-card">
//                 <label htmlFor="fileUpload">
//                     <div className="placeholder-text">Click to add a PDF</div>
//                 </label>
//                 <input 
//                     id="fileUpload" 
//                     type="file" 
//                     accept="application/pdf" 
//                     style={{ display: 'none' }} 
//                     onChange={handleFileUpload} 
//                 />
//             </div>
//         </div>
//     );
// };

// export default CardGrid;

import React from 'react';
import Card from './Card';

const CardGrid = ({ cards, removeCard, updateCard }) => {
    return (
        <div className="grid-container">
            {cards.map((card) => (
                <Card 
                    key={card.id} 
                    id={card.id} 
                    pdf={card.pdf} 
                    name={card.name} 
                    removeCard={removeCard} 
                    updateCard={updateCard} 
                />
            ))}
        </div>
    );
};

export default CardGrid;
