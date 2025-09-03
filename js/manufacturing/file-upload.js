document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileList = document.getElementById('file-list');
    const processButton = document.getElementById('process-button');
    const processingInfo = document.getElementById('processing-info');
    const completionContainer = document.getElementById('completion-container');

    let uploadedFiles = [];

    // **Backend Endpoint URL Placeholder**
    const backendEndpointUrl = 'http://127.0.0.1:8000/upload_cad_pdf/'; 

    // --- Core Demo Logic ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('highlight');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('highlight');
        }, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileElem.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        // The backend only supports a single file, so we'll only take the first one.
        uploadedFiles = files.length > 0 ? [files[0]] : [];
        displayFiles();
        processButton.disabled = false;
        completionButtons.style.display = 'none';
        processingInfo.style.display = 'none';
        processButton.style.display = 'block';
    }

    function displayFiles() {
        fileList.innerHTML = '';
        if (uploadedFiles.length === 0) {
            fileList.innerHTML = '<li>No files selected yet.</li>';
            processButton.disabled = true;
        } else {
            uploadedFiles.forEach(file => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${(file.size / 1024).toFixed(2)} KB</span>
                `;
                fileList.appendChild(li);
            });
        }
    }

    // --- Main Action Trigger ---
    processButton.addEventListener('click', () => {
        processButton.style.display = 'none';
        processingInfo.style.display = 'block';

         /*
        // --- Demo Simulation (Active for now) ---
        // Once the backend is ready, comment out this block.
        setTimeout(() => {
            processingInfo.style.display = 'none';
            completionContainer.style.display = 'flex';
        }, 3000);

        */

        // --- Real API Integration (Commented out for now) ---
       
        // Uncomment this section when you're ready to connect to the backend.
        if (uploadedFiles.length > 0) {
            const formData = new FormData();
            if (uploadedFiles.length > 0) {
                formData.append('file', uploadedFiles[0]); // 'file' must match the backend's expected field name
            }

            fetch(backendEndpointUrl, {
                method: 'POST',
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Handle successful response from the backend
                console.log('Files processed successfully:', data);
                processingInfo.style.display = 'none';
                completionContainer.style.display = 'flex';
            })
            .catch(error => {
                // Handle any errors during the upload
                console.error('Upload error:', error);
                processingInfo.innerHTML = '<p style="color: red;">Error processing files. Please try again.</p>';
                // You might want to re-enable the button or offer a retry option here
            });
        } else {
            // Handle no files selected case
            processingInfo.style.display = 'none';
            alert('Please select files to upload.');
            processButton.style.display = 'block';
        }
    });

    // Initial state setup
    displayFiles();
});
