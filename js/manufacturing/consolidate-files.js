document.addEventListener('DOMContentLoaded', () => {
    // --- Get company name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');

    // --- References for State Management ---
    const initialStateContainer = document.getElementById('initial-state-container');
    const unifiedStateContainer = document.getElementById('unified-state-container');
    const pageTitle = document.getElementById('pageTitle');
    const unifiedTitle = document.getElementById('unifiedTitle');

    // --- References for Initial State (Upload) UI ---
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileList = document.getElementById('file-list');
    const processButton = document.getElementById('processButton');
    const processingInfo = document.getElementById('processing-info');
    const unifyMessage = document.getElementById('unify-message');
    const successMessage = document.getElementById('success-message');
    
    // --- References for Unified State (Completion) UI ---
    const chatButton = document.getElementById('chatButton');
    const insightsButton = document.querySelector('.view-dashboard');

    // **Backend Endpoint URL**
    const backendEndpointUrl = 'http://127.0.0.1:8000/upload_cad_pdf/';
    let uploadedFile = null;

    // --- Check for URL parameter to determine UI state on page load ---
    const isUnified = urlParams.get('unified');
    if (isUnified === 'true') {
        showUnifiedState();
    } else {
        showInitialState();
    }
    
    // Function to set the initial UI state
    function showInitialState() {
        if (companyName) {
            pageTitle.textContent = `Unify Data for ${companyName}`;
        }
        initialStateContainer.style.display = 'block';
        unifiedStateContainer.style.display = 'none';
        resetStatus();
    }

    // Function to set the unified UI state
    function showUnifiedState() {
        if (companyName) {
            unifiedTitle.textContent = `${companyName}'s Data is Unified`;
        }
        initialStateContainer.style.display = 'none';
        unifiedStateContainer.style.display = 'block';
        // Update the links to pass the company name
        chatButton.href = `conversation-ai.html?company=${encodeURIComponent(companyName)}`;
        // Insights button's href doesn't change, so no need to update it here unless we need the company name
    }

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

    dropArea.addEventListener('click', (e) => {
        if (e.target.id === 'processButton') {
            return;
        }
        fileElem.click();
    });
    
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
        uploadedFile = files.length > 0 ? files[0] : null;
        displayFiles();
        if (uploadedFile) {
            processButton.disabled = false;
            processButton.style.display = 'block'; // Show the button
        } else {
            processButton.disabled = true;
            processButton.style.display = 'none'; // Hide the button
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
        processButton.style.display = 'block';
    }

    // --- Main Action Trigger for Engineering Diagram ---
    processButton.addEventListener('click', async () => {
        if (!uploadedFile) {
            alert('Please select a file to upload.');
            return;
        }

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
            
            processingInfo.style.display = 'none';
            unifyMessage.style.display = 'none';

            // Show unified state on success
            showUnifiedState();

            // Append a URL parameter to the current page to preserve the state
            const newUrl = `${window.location.pathname}?company=${encodeURIComponent(companyName)}&unified=true`;
            history.pushState({}, '', newUrl);

        } catch (error) {
            console.error('Upload error:', error);
            processingInfo.style.display = 'none';
            unifyMessage.style.display = 'none';
            successMessage.textContent = `Error: ${error.message}`;
            successMessage.style.color = 'red';
            successMessage.style.display = 'block';
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
            uploadStatus.textContent = "Integrated system successfully!";
            uploadStatus.style.color = 'green';
            uploadStatus.style.display = 'block';
        } else {
            uploadStatus.textContent = "";
            uploadStatus.style.display = 'none';
        }
    }

    setupLocalUpload(erpDropArea, erpFileElem, erpFileList, erpUploadStatus);
    setupLocalUpload(crmDropArea, crmFileElem, crmFileList, crmUploadStatus);

    // --- Dropdown Menu Logic (retained) ---
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (dropdownToggle && dropdownMenu) {
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
    }
});
