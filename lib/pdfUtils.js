import * as pdfjsLib from 'pdfjs-dist';

// Initialize worker source
// We use unpkg or cdnjs. unpkg with specific version is reliable.
// Note: 'pdf.worker.min.mjs' might be needed for newer versions, or just .js.
// Let's rely on the build version.
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Converts a PDF file into an array of Image Files (one per page).
 * @param {File} file - The PDF file to convert.
 * @returns {Promise<File[]>} - Array of image files (JPEGs).
 */
export const convertPdfToImages = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const images = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        // Scale 2.0 provides good resolution for OCR
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Convert canvas to Blob
        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.95);
        });

        // Create a File object from the Blob
        const imageFile = new File([blob], `page_${pageNum}.jpg`, { type: 'image/jpeg' });
        images.push(imageFile);
    }

    return images;
};
