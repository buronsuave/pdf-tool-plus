export const getPdfUrl = (storageId) => {
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/pdf-viewer-b83aa.appspot.com/o/';
    const encodedPath = encodeURIComponent(storageId); // Encode the path for URL
    return `${baseUrl}${encodedPath}?alt=media`;
};
