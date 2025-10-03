document.addEventListener('DOMContentLoaded', () => {
    // --- Get company name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');

    // --- References for State Management ---
    const initialStateContainer = document.getElementById('initial-state-container');
    const unifiedStateContainer = document.getElementById('unified-state-container');
    const pageTitle = document.getElementById('pageTitle');
    const unifiedTitle = document.getElementById('unifiedTitle');

    // --- References for Engineering (Main) System ---
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileList = document.getElementById('file-list');
    const processButton = document.getElementById('processButton');
    const processingInfo = document.getElementById('processing-info');
    const unifyMessage = document.getElementById('unify-message');
    const successMessage = document.getElementById('success-message');
    const engineeringInputGroup = document.getElementById('engineering-input-group');
    const engineeringPreviewContainer = document.getElementById('engineering-preview-container');
    
    // **Backend Endpoint URL**
    const backendEndpointUrl = 'http://127.0.0.1:8000/upload_cad_pdf/';
    
    // State object to track uploads
    let uploadedFile = null;
    let erpFileLoaded = false;
    let crmFileLoaded = false;
    let engineeringFileLoaded = false;

    // --- References for Unified State (Completion) UI ---
    const chatButton = document.getElementById('chatButton');

    // --- Check for URL parameter to determine UI state on page load ---
    const isUnified = urlParams.get('unified');
    if (isUnified === 'true') {
        showUnifiedState();
    } else {
        showInitialState();
    }
    
    // --- State and UI Management Functions ---

    function showInitialState() {
        if (companyName) {
            pageTitle.textContent = `Unify Data for ${companyName}`;
        }
        initialStateContainer.style.display = 'block';
        unifiedStateContainer.style.display = 'none';
        resetStatus();
    }

    function showUnifiedState() {
        if (companyName) {
            unifiedTitle.textContent = `${companyName}'s Data is Unified`;
        }
        initialStateContainer.style.display = 'none';
        unifiedStateContainer.style.display = 'block';
        chatButton.href = `conversation-ai.html?company=${encodeURIComponent(companyName)}`;
    }

    function updateProcessButtonState() {
        // Only enable the main process button if the engineering file is loaded
        const canProcess = engineeringFileLoaded;
        processButton.disabled = !canProcess;
        // Show the button if at least the Engineering file is loaded
        processButton.style.display = canProcess ? 'block' : 'none';
    }

    function resetStatus() {
        processingInfo.style.display = 'none';
        unifyMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }

    // Drag/Drop helper function
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // --- Engineering System File Handling ---

    // Setup drag/drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

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

    dropArea.addEventListener('click', () => {
        fileElem.click();
    });
    
    dropArea.addEventListener('drop', handleDropEngineering, false);

    fileElem.addEventListener('change', (e) => {
        handleFilesEngineering(e.target.files);
    });

    function handleDropEngineering(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFilesEngineering(files);
    }

    function handleFilesEngineering(files) {
        uploadedFile = files.length > 0 ? files[0] : null;
        engineeringFileLoaded = uploadedFile !== null;
        
        if (engineeringFileLoaded) {
            // Show the spinner and start the 2-second timeout for a smooth transition
            const system = systems.find(s => s.name === 'engineering');
            showLocalLoading(system, files, () => {
                displayFilesEngineering();
                updateEngineeringCardState();
                updateProcessButtonState();
                resetStatus();
            });
        } else {
            // If no file, just reset
            displayFilesEngineering();
            updateEngineeringCardState();
            updateProcessButtonState();
            resetStatus();
        }
    }

    function displayFilesEngineering() {
        fileList.innerHTML = '';
        if (uploadedFile) {
            const li = document.createElement('li');
            li.innerHTML = `<span class="file-name"><i class="fa-solid fa-file-pdf"></i> ${uploadedFile.name} Loaded</span>`;
            fileList.appendChild(li);
        }
    }

    function updateEngineeringCardState() {
        if (engineeringFileLoaded) {
            engineeringInputGroup.style.display = 'none';
            engineeringPreviewContainer.style.display = 'flex';
        } else {
            engineeringInputGroup.style.display = 'flex';
            engineeringPreviewContainer.style.display = 'none';
        }
    }

    // --- Main Action Trigger for Engineering Diagram (Unified Button) ---
    processButton.addEventListener('click', async () => {
        if (!uploadedFile) {
            alert('Please upload an Engineering Diagram to proceed.');
            return;
        }

        processButton.style.display = 'none';
        processingInfo.style.display = 'block';
        unifyMessage.style.display = 'block';
        unifyMessage.textContent = `Now unifying data for ${companyName || 'your company'}... this may take a moment.`;
        successMessage.style.display = 'none';

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            // BACKEND LOGIC REMAINS THE SAME
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

    // --- Logic for CRM & ERP Local Uploads (Visual Only) ---
    const systems = [
        { 
            name: 'erp', 
            dropArea: document.getElementById('erpDropArea'), 
            fileElem: document.getElementById('erpFileElem'), 
            fileList: document.getElementById('erpFileList'), 
            uploadStatus: document.getElementById('erpUploadStatus'),
            inputGroup: document.getElementById('erp-input-group'),
            previewContainer: document.getElementById('erp-preview-container'),
            stateVar: 'erpFileLoaded'
        },
        { 
            name: 'crm', 
            dropArea: document.getElementById('crmDropArea'), 
            fileElem: document.getElementById('crmFileElem'), 
            fileList: document.getElementById('crmFileList'), 
            uploadStatus: document.getElementById('crmUploadStatus'),
            inputGroup: document.getElementById('crm-input-group'),
            previewContainer: document.getElementById('crm-preview-container'),
            stateVar: 'crmFileLoaded'
        },
        // Adding engineering system to the array for easy access to elements
        {
            name: 'engineering',
            dropArea: document.getElementById('drop-area'), 
            fileElem: document.getElementById('fileElem'), 
            fileList: document.getElementById('file-list'), 
            uploadStatus: document.getElementById('erpUploadStatus'), // Not used here, but keeping structure
            inputGroup: document.getElementById('engineering-input-group'),
            previewContainer: document.getElementById('engineering-preview-container'),
            stateVar: 'engineeringFileLoaded'
        }
    ];

    // NEW FUNCTION: Handles the spinner/loading animation
    function showLocalLoading(system, files, callback) {
        // Hide file upload box and display the spinner temporarily
        system.dropArea.style.display = 'none';
        
        // Show loading state in the input group area (Engineering uses fileList, ERP/CRM uses uploadStatus)
        const spinnerHtml = `<div class="system-loading"><div class="loading-spinner"></div><p>Processing ${system.name.toUpperCase()} data...</p></div>`;
        system.inputGroup.insertAdjacentHTML('beforeend', spinnerHtml);
        
        // 2-second delay
        setTimeout(() => {
            // Remove spinner
            const spinner = system.inputGroup.querySelector('.system-loading');
            if (spinner) spinner.remove();

            // Restore drop area for engineering (only for engineering, others will be hidden later)
            if (system.name === 'engineering') {
                 system.dropArea.style.display = 'flex';
            }

            // Execute the callback to show the success state (image preview)
            callback();
        }, 2000);
    }
    
    function setupLocalUpload(system) {
        if (system.name === 'engineering') return; // Skip engineering setup here, handled above

        // Drag/Drop visual feedback
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            system.dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            system.dropArea.addEventListener(eventName, () => system.dropArea.classList.add('highlight'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            system.dropArea.addEventListener(eventName, () => system.dropArea.classList.remove('highlight'), false);
        });

        system.dropArea.addEventListener('click', () => system.fileElem.click());

        system.fileElem.addEventListener('change', () => handleLocalFiles(system, system.fileElem.files));
        system.dropArea.addEventListener('drop', (e) => handleLocalFiles(system, e.dataTransfer.files));
    }

    function handleLocalFiles(system, files) {
        const fileLoaded = files.length > 0;
        
        if (fileLoaded) {
            // Start loading sequence
            system.inputGroup.style.display = 'flex'; // Ensure the input group container is visible for the spinner
            system.dropArea.style.display = 'none'; // Hide the drop area itself
            
            showLocalLoading(system, files, () => {
                // Update internal state
                if (system.name === 'erp') erpFileLoaded = true;
                if (system.name === 'crm') crmFileLoaded = true;
                
                // Final Visual feedback
                system.fileList.innerHTML = '';
                const li = document.createElement('li');
                li.innerHTML = `<span class="file-name"><i class="fa-solid fa-file-invoice"></i> ${files[0].name}</span>`;
                system.fileList.appendChild(li);
                system.uploadStatus.textContent = "System data integrated successfully!";
                system.uploadStatus.style.color = 'green';
                system.uploadStatus.style.display = 'block';

                // Show preview and hide input group
                system.inputGroup.style.display = 'none';
                system.previewContainer.style.display = 'flex';
                updateProcessButtonState();
            });

        } else {
            // Reset visual feedback if files is empty
            system.uploadStatus.textContent = "";
            system.uploadStatus.style.display = 'none';
            system.fileList.innerHTML = '';
            system.dropArea.style.display = 'flex';
            updateProcessButtonState();
        }
    }
    
    // --- Reset Functionality for all cards ---
    document.querySelectorAll('.reset-upload-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const systemName = e.target.getAttribute('data-system');
            
            if (systemName === 'engineering') {
                // Reset Engineering state
                uploadedFile = null;
                engineeringFileLoaded = false;
                fileList.innerHTML = '';
                fileElem.value = ''; // Clear file input
                updateEngineeringCardState();
                
                // Show drop area and hide preview
                const engSystem = systems.find(s => s.name === 'engineering');
                engSystem.inputGroup.style.display = 'flex';
                engSystem.dropArea.style.display = 'flex';
                engSystem.previewContainer.style.display = 'none';

            } else {
                // Reset ERP/CRM state
                const system = systems.find(s => s.name === systemName);
                if (system) {
                    if (system.name === 'erp') erpFileLoaded = false;
                    if (system.name === 'crm') crmFileLoaded = false;
                    
                    system.fileElem.value = ''; // Clear file input
                    system.uploadStatus.style.display = 'none';
                    system.fileList.innerHTML = '';
                    system.inputGroup.style.display = 'flex';
                    system.dropArea.style.display = 'flex';
                    system.previewContainer.style.display = 'none';
                }
            }
            updateProcessButtonState();
            resetStatus();
        });
    });

    // Initialize event listeners
    systems.forEach(setupLocalUpload);
    updateProcessButtonState(); // Initial check for button state

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
