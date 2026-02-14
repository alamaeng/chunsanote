
/**
 * Converts a PDF file into an array of Image Files (one per page).
 * @param {File} file - The PDF file to convert.
 * @returns {Promise<File[]>} - Array of image files (JPEGs).
 */
export const convertPdfToImages = async (file) => {
    // Dynamic import to avoid SSR issues with canvas/DOMMatrix
    const pdfjsLib = await import('pdfjs-dist');

    // Initialize worker source
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const images = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        // Scale 3.0 provides better resolution for OCR, especially for small text/formulas
        const viewport = page.getViewport({ scale: 3.0 });

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
