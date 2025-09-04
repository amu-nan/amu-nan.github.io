document.addEventListener('DOMContentLoaded', () => {
    // --- Get company name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');

    if (companyName) {
        document.getElementById('pageTitle').textContent = `Consolidate Data for ${companyName}`;
    }

    // --- References for Engineering Diagram Upload ---
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileList = document.getElementById('file-list');
    const processButton = document.getElementById('processButton');
    const processingInfo = document.getElementById('processing-info');
    const unifyMessage = document.getElementById('unify-message');
    const successMessage = document.getElementById('success-message');
    const completionContainer = document.getElementById('completion-container');
    const continueButton = document.getElementById('continue-button');

    // **Backend Endpoint URL**
    const backendEndpointUrl = 'http://127.0.0.1:8000/upload_cad_pdf/';
    let uploadedFile = null;

    // --- Core File Handling Logic for Engineering Diagram ---
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

    // Handle click to open file dialog
    dropArea.addEventListener('click', () => fileElem.click());
    
    dropArea.addEventListener('drop', handleDrop, false);

    fileElem.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        // Enforce single-file upload as the backend only accepts one.
        uploadedFile = files.length > 0 ? files[0] : null;
        displayFiles();
        if (uploadedFile) {
            processButton.disabled = false;
        } else {
            processButton.disabled = true;
        }
        resetStatus();
    }

    function displayFiles() {
        fileList.innerHTML = '';
        if (uploadedFile) {
            const li = document.createElement('li');
            li.innerHTML = `<span class="file-name">${uploadedFile.name}</span>`;
            fileList.appendChild(li);
        }
    }

    function resetStatus() {
        processingInfo.style.display = 'none';
        unifyMessage.style.display = 'none';
        successMessage.style.display = 'none';
        completionContainer.style.display = 'none';
        processButton.style.display = 'block';
    }

    // --- Main Action Trigger for Engineering Diagram ---
    processButton.addEventListener('click', async () => {
        if (!uploadedFile) {
            alert('Please select a file to upload.');
            return;
        }

        // Show loading state and hide process button
        processButton.style.display = 'none';
        processingInfo.style.display = 'block';
        unifyMessage.style.display = 'block';
        unifyMessage.textContent = `Now unifying data for ${companyName || 'your company'}...`;

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            const response = await fetch(backendEndpointUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Network response was not ok: ${text}`);
            }

            const data = await response.json();
            console.log('Files processed successfully:', data);
            
            // Hide loading state and show success message and continue button
            processingInfo.style.display = 'none';
            unifyMessage.style.display = 'none';
            successMessage.textContent = "Your data has been unified!";
            successMessage.style.color = '#28a745';
            successMessage.style.display = 'block';
            completionContainer.style.display = 'block';

        } catch (error) {
            console.error('Upload error:', error);
            // Hide loading and show error message
            processingInfo.style.display = 'none';
            unifyMessage.style.display = 'none';
            successMessage.textContent = `Error: ${error.message}`;
            successMessage.style.color = 'red';
            successMessage.style.display = 'block';
            // Show the process button again so the user can retry
            processButton.style.display = 'block';
        }
    });

    // --- Logic for CRM & ERP Local Uploads (Front-End Only) ---
    const erpDropArea = document.getElementById('erpDropArea');
    const erpFileElem = document.getElementById('erpFileElem');
    const erpFileList = document.getElementById('erpFileList');
    const erpUploadStatus = document.getElementById('erpUploadStatus');

    const crmDropArea = document.getElementById('crmDropArea');
    const crmFileElem = document.getElementById('crmFileElem');
    const crmFileList = document.getElementById('crmFileList');
    const crmUploadStatus = document.getElementById('crmUploadStatus');

    function setupLocalUpload(dropArea, fileElem, fileList, uploadStatus) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
        });

        // Handle click to open file dialog for CRM/ERP
        dropArea.addEventListener('click', () => fileElem.click());

        fileElem.addEventListener('change', () => handleLocalFiles(fileElem.files, fileList, uploadStatus));
        dropArea.addEventListener('drop', (e) => handleLocalFiles(e.dataTransfer.files, fileList, uploadStatus));
    }

    function handleLocalFiles(files, fileList, uploadStatus) {
        fileList.innerHTML = '';
        if (files.length > 0) {
            const li = document.createElement('li');
            li.innerHTML = `<span class="file-name">${files[0].name}</span>`;
            fileList.appendChild(li);
            uploadStatus.textContent = "Data loaded successfully!";
            uploadStatus.style.color = 'green';
            uploadStatus.style.display = 'block';
        } else {
            uploadStatus.textContent = "";
            uploadStatus.style.display = 'none';
        }
    }

    setupLocalUpload(erpDropArea, erpFileElem, erpFileList, erpUploadStatus);
    setupLocalUpload(crmDropArea, crmFileElem, crmFileList, crmUploadStatus);

    // --- Final Navigation ---
    continueButton.addEventListener('click', () => {
        // Redirect to file-upload.html with the company name
        window.location.href = `file-upload.html?company=${encodeURIComponent(companyName)}`;
    });

    // --- Dropdown Menu Logic (retained) ---
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    dropdownToggle.addEventListener('click', function(event) {
        event.preventDefault();
        dropdownMenu.classList.toggle('show');
    });

    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-toggle') && !event.target.closest('.dropdown')) {
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        }
    });
});
