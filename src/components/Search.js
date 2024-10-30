import React, { useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Card from './Card';

GlobalWorkerOptions.workerSrc = 
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const Search = ({ cards, addCard, removeCard, updateCard }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [generatedPdfUrl, setGeneratedPdfUrl] = useState('');
    const [id, setId] = useState('');

    const sanitizeText = (text) => {
        // eslint-disable-next-line no-control-regex
        return text.replace(/[^\x00-\xFF]/g, ''); // Remove non-ASCII characters
    };
    

    const handleSearch = async () => {
        const searchResults = await Promise.all(cards.map((card) => searchPDF(card.pdf, searchTerm, card.name)));
        
        if (searchResults.flat().length > 0) {
            createPdf(searchResults.flat());
        }
    };

    const searchPDF = async (pdfUrl, searchTerm, name) => {
        const loadingTask = getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const foundResults = [];
        
        var paraIndex = 1;
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageParagraphs = textContent.items.map(item => item.str);
            const pageText = pageParagraphs.join(' ');
            const paraTexts = pageText.split(".  ");
            for (var paraIter = 0; paraIter < paraTexts.length; paraIter++){
                if (paraTexts[paraIter].includes(searchTerm)) {
                    foundResults.push({ name, paragraph: paraTexts[paraIter], paraIndex: paraIndex });
                }
                paraIndex++;
            }
        }

        return foundResults;
    };

    const createPdf = async (results) => {
        const pdfDoc = await PDFDocument.create();
        var page = pdfDoc.addPage();
        
        // Embed the Helvetica font from StandardFonts
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
        const pageWidth = page.getWidth() - 100; // 50px margin on each side
        const pageHeight = page.getHeight() - 70; // 50px margin at the bottom
        const textSize = 12;
        const margin = 50; // Margin from the top
        let yPosition = pageHeight - margin; // Start drawing from the top
    
        // Add the date
        const currentDate = new Date().toLocaleDateString();
        page.drawText(`Date: ${currentDate}`, {
            x: 50,
            y: yPosition,
            size: textSize,
            font: font,
            color: rgb(0, 0, 0),
        });
        yPosition -= textSize * 1.5; // Move down for the next line
    
        // Add the searched term
        page.drawText(`Searched Term: "${sanitizeText(searchTerm)}"`, {
            x: 50,
            y: yPosition,
            size: textSize,
            font: font,
            color: rgb(0, 0, 0),
        });
        yPosition -= textSize * 2; // Add extra spacing after the searched term
    
        // Set up the text to write to the PDF
        let textContent = "Search Results:\n\n";
        results.forEach(result => {
            textContent += `Document ${result.name}: "${sanitizeText(result.paragraph)}" (Paragraph ${result.paraIndex + 1})\n\n`;
        });
    
        // Split the text into lines
        const lines = textContent.split('\n');
    
        for (const line of lines) {
            const words = line.split(' ');
            let currentLine = '';
    
            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const width = font.widthOfTextAtSize(testLine, textSize);
    
                if (width > pageWidth) {
                    // Draw the current line and reset for the next line
                    page.drawText(currentLine, {
                        x: 50,
                        y: yPosition,
                        size: textSize,
                        font: font,
                        color: rgb(0, 0, 0),
                    });
                    currentLine = word; // Start new line with the current word
                    yPosition -= textSize * 1.5; // Move down for the next line
    
                    // Check if we need to create a new page if we run out of space
                    if (yPosition < margin) {
                        // Add a new page and reset yPosition
                        yPosition = pageHeight - margin; // Reset yPosition for new page
                        page = pdfDoc.addPage(); // Add a new page
                    }
                } else {
                    currentLine = testLine; // Update the current line
                }
            }
    
            // Draw any remaining text in the current line
            if (currentLine) {
                page.drawText(currentLine, {
                    x: 50,
                    y: yPosition,
                    size: textSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                yPosition -= textSize * 1.5; // Move down for the next line
            }
    
            yPosition -= textSize * 1.5; // Additional spacing between paragraphs
        }
    
        // Save the PDF and generate a URL
        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        setGeneratedPdfUrl(pdfUrl); // Save the URL to state
        setId(addCard(pdfUrl));
    };
    

    return (
        <div className="search-container">
            <h2>Search PDFs</h2>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter search term"
            />
            <button onClick={handleSearch}>Search</button>

            {generatedPdfUrl && (
                <div>
                    <h3>Generated PDF:</h3>
                    <Card id={id} pdf={generatedPdfUrl} 
                        removeCard={() => {removeCard(); setGeneratedPdfUrl(''); }} 
                        updateCard={updateCard}/>
                </div>
            )}
        </div>
    );
};

export default Search;
