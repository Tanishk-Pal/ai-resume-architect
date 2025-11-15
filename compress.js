// Replace your entire compress.js file with this
document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('pdf-upload');
    const uploaderArea = document.getElementById('uploader-area');
    const fileNameSpan = document.getElementById('file-name');
    const compressBtn = document.getElementById('compress-btn');
    const resultsArea = document.getElementById('results-area');
    const downloadArea = document.getElementById('download-area');
    const loader = document.getElementById('loader');
    let uploadedFile = null;

    uploaderArea.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            // Updated to handle 50MB limit
            if (file.size > 50 * 1024 * 1024) {
                fileNameSpan.textContent = 'File is too large (Max 50MB).';
                compressBtn.disabled = true; uploadedFile = null;
            } else {
                fileNameSpan.textContent = `Selected: ${file.name}`;
                compressBtn.disabled = false; uploadedFile = file;
            }
        } else {
            fileNameSpan.textContent = 'Please choose a valid PDF file.';
            compressBtn.disabled = true; uploadedFile = null;
        }
    });

    compressBtn.addEventListener('click', async () => {
        if (!uploadedFile) return;
        compressBtn.disabled = true;
        loader.classList.add('show');
        resultsArea.style.display = 'none';

        const formData = new FormData();
        formData.append('pdf', uploadedFile);

        try {
            const response = await fetch('http://localhost:3000/api/compress', {
                method: 'POST', body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server error during compression.');
            }
            const result = await response.json();

            // --- THIS IS THE AUTOMATIC DOWNLOAD FIX ---
            displayAndTriggerDownload(result.downloadUrl, uploadedFile.name);

        } catch (error) {
            console.error('Compression failed:', error);
            alert(`Error: ${error.message}`);
        } finally {
            loader.classList.remove('show');
            compressBtn.disabled = false;
        }
    });

    // --- EDITED: This function now triggers the download automatically ---
    function displayAndTriggerDownload(url, originalFileName) {
        // 1. Create the link
        const downloadBtn = document.createElement('a');
        downloadBtn.href = url;
        const downloadName = `compressed-${originalFileName}`;
        downloadBtn.setAttribute('download', downloadName);

        // 2. Trigger the download automatically
        downloadBtn.click();

        // 3. Display a fallback link for the user
        downloadArea.innerHTML = `<p>Your download has started! If not, click the link below:</p>`;
        const fallbackLink = document.createElement('a');
        fallbackLink.href = url;
        fallbackLink.textContent = 'Download Compressed PDF Again';
        fallbackLink.className = 'generate-btn';
        fallbackLink.setAttribute('download', downloadName);
        downloadArea.appendChild(fallbackLink);

        resultsArea.style.display = 'block';
    }
});