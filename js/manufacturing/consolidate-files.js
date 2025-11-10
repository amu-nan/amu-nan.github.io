document.addEventListener('DOMContentLoaded', () => {
    // --- Get company name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');

    // --- References for State Management ---
    const initialStateContainer = document.getElementById('initial-state-container');
    const unifiedStateContainer = document.getElementById('unified-state-container');
    const pageTitle = document.getElementById('pageTitle');
    const unifiedTitle = document.getElementById('unifiedTitle');

    // --- References for Engineering System (Main Upload) ---
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileList = document.getElementById('file-list');
    const processButton = document.getElementById('processButton');
    const processingInfo = document.getElementById('processing-info');
    const unifyMessage = document.getElementById('unify-message');
    const successMessage = document.getElementById('success-message');
    const engineeringInputGroup = document.getElementById('engineering-input-group');
    const engineeringPreviewContainer = document.getElementById('engineering-preview-container');
    
    // --- References for Enterprise System (New Dropdown Logic) ---
    const enterpriseInputGroup = document.getElementById('enterprise-input-group');
    const systemSelect = document.getElementById('system-select');
    const moduleSelectionContainer = document.getElementById('module-selection-container');
    const moduleIntegrateBtn = document.getElementById('moduleIntegrateBtn');
    const enterpriseModuleCheckboxes = document.querySelectorAll('.module-group input[type="checkbox"]');
    const enterprisePreviewContainer = document.getElementById('enterprise-preview-container');
    const integratedSystemsList = document.getElementById('integrated-systems-list'); 

    const apiInput = document.getElementById('system-api-url');
    const apiStatus = document.getElementById('api-connect-status');
    const integrateMoreBtn = document.querySelector('.integrate-more-btn');
    const resetAllBtn = document.querySelector('.reset-all-btn');


    // **Backend Endpoint URL**
    const backendEndpointUrl = 'http://127.0.0.1:8000/upload_cad_pdf/';
    
    // State object to track uploads
    let uploadedFile = null;
    let engineeringFileLoaded = false;
    let integratedSystems = []; // Array to store integrated system objects
    let selectedEnterpriseSystem = '';
    let selectedModules = [];

    // --- Global helper to map system names for display ---
    const systemNameMap = {
        erp: 'ERP System',
        crm: 'CRM System',
        scm: 'SCM System'
    };

    // --- References for Unified State (Completion) UI ---
    const chatButton = document.getElementById('chatButton');

    // --- Initial State Check ---
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
        // Enable if BOTH engineering file AND at least one enterprise system are integrated
        const canProcess = engineeringFileLoaded && integratedSystems.length > 0;
        processButton.disabled = !canProcess;
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

    // --- Engineering System File Handling (UNCHANGED BACKEND LOGIC) ---

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

    function showEngineeringLocalLoading(files, callback) {
        dropArea.style.display = 'none';
        
        const spinnerHtml = `<div class="system-loading" id="engineering-loading-spinner"><div class="loading-spinner"></div><p>Processing Engineering data...</p></div>`;
        engineeringInputGroup.insertAdjacentHTML('beforeend', spinnerHtml);
        
        setTimeout(() => {
            document.getElementById('engineering-loading-spinner')?.remove();
            dropArea.style.display = 'flex';
            callback();
        }, 2000);
    }


    function handleFilesEngineering(files) {
        uploadedFile = files.length > 0 ? files[0] : null;
        engineeringFileLoaded = uploadedFile !== null;
        
        if (engineeringFileLoaded) {
            showEngineeringLocalLoading(files, () => {
                displayFilesEngineering();
                updateEngineeringCardState();
                updateProcessButtonState();
                resetStatus();
            });
        } else {
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
        if (integratedSystems.length === 0) {
             alert('Please select and integrate at least one Enterprise System.');
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

            showUnifiedState();

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

    // --- Enterprise System Dropdown and Module Selection Logic (FIXED) ---
    
    function updateApiPlaceholder(system) {
        let placeholder = 'e.g., https://api.mysystem.com/data';
        if (system === 'erp') placeholder = 'e.g., https://api.sap.com/data/v1/sales';
        if (system === 'crm') placeholder = 'e.g., https://api.salesforce.com/services';
        if (system === 'scm') placeholder = 'e.g., https://api.oracle.com/supplychain';
        apiInput.placeholder = placeholder;
        apiStatus.textContent = ''; 
        apiInput.value = '';        
    }

    function updateIntegratedSystemsDisplay() {
        integratedSystemsList.innerHTML = '';
        if (integratedSystems.length === 0) return;

        const ul = document.createElement('ul');
        ul.className = 'integrated-list';
        
        integratedSystems.forEach(sys => {
            const li = document.createElement('li');
            
            // FIX #2: Use <strong> instead of Markdown **
            li.innerHTML = `<i class="fa-solid fa-check-circle"></i> <strong>${sys.name}</strong> Integrated (${sys.modules.length} modules)`;
            ul.appendChild(li);
        });

        integratedSystemsList.appendChild(ul);
        
        if (integratedSystems.length > 0) {
            resetAllBtn.style.display = 'inline-block';
            integrateMoreBtn.style.display = 'inline-block';
        } else {
            resetAllBtn.style.display = 'none';
            integrateMoreBtn.style.display = 'none';
        }
    }

    systemSelect.addEventListener('change', function() {
        selectedEnterpriseSystem = this.value;
        const moduleGroups = document.querySelectorAll('.module-group');
        
        moduleGroups.forEach(group => {
            group.style.display = 'none';
            group.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        });
        moduleSelectionContainer.style.display = 'none';

        if (selectedEnterpriseSystem) {
            updateApiPlaceholder(selectedEnterpriseSystem);
            
            document.getElementById(`${selectedEnterpriseSystem}-modules`).style.display = 'flex'; 
            moduleSelectionContainer.style.display = 'flex'; 
        }
        
        selectedModules = [];
        moduleIntegrateBtn.disabled = true;
    });

    enterpriseModuleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const currentModuleGroup = document.getElementById(`${selectedEnterpriseSystem}-modules`);
            
            if (currentModuleGroup) {
                selectedModules = Array.from(currentModuleGroup.querySelectorAll('input:checked'))
                                       .map(input => input.value);
                
                const apiEntered = apiInput.value.length > 5;
                
                moduleIntegrateBtn.disabled = !(apiEntered && selectedModules.length > 0);
            }
        });
    });

    apiInput.addEventListener('input', function() {
        const currentModuleGroup = document.getElementById(`${selectedEnterpriseSystem}-modules`);
        if (currentModuleGroup) {
            const modulesSelected = Array.from(currentModuleGroup.querySelectorAll('input:checked')).length > 0;
            const apiEntered = apiInput.value.length > 5;
            moduleIntegrateBtn.disabled = !(apiEntered && modulesSelected);
        }
        apiStatus.textContent = '';
        apiStatus.style.color = 'inherit';
    });

    moduleIntegrateBtn.addEventListener('click', function() {
        if (selectedModules.length > 0) {
            const api = apiInput.value;
            if (!api || api.length < 5) {
                apiStatus.textContent = 'A valid API connection URL is required.';
                apiStatus.style.color = 'red';
                return;
            }

            const existingIndex = integratedSystems.findIndex(sys => sys.system === selectedEnterpriseSystem);
            
            const systemObject = {
                system: selectedEnterpriseSystem,
                name: systemNameMap[selectedEnterpriseSystem],
                modules: selectedModules,
                apiUrl: api
            };
            
            if (existingIndex !== -1) {
                integratedSystems[existingIndex] = systemObject;
            } else {
                integratedSystems.push(systemObject);
            }
            
            // 1. Hide selection, show loading spinner
            moduleSelectionContainer.style.display = 'none';
            systemSelect.style.display = 'none';
            
            const spinnerHtml = `<div class="system-loading" id="enterprise-loading-spinner"><div class="loading-spinner"></div><p>Integrating <strong>${systemObject.name}</strong> data...</p></div>`;
            enterpriseInputGroup.insertAdjacentHTML('beforeend', spinnerHtml);

            // Simulate a 2-second integration
            setTimeout(() => {
                // FIX #1: Remove loading spinner and immediately transition to PREVIEW state
                document.getElementById('enterprise-loading-spinner')?.remove();
                
                // 2. Update state and show success preview
                updateIntegratedSystemsDisplay();
                
                // HIDE the input group and SHOW the preview container
                enterpriseInputGroup.style.display = 'none'; 
                enterprisePreviewContainer.style.display = 'flex';
                
                updateProcessButtonState();
            }, 2000); 
        }
    });

    // --- Reset/Integrate Another Functionality (FIXED) ---
    document.querySelectorAll('.reset-upload-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const systemName = e.target.getAttribute('data-system');
            const action = e.target.getAttribute('data-action');
            
            if (systemName === 'engineering') {
                // ... (Engineering Reset Logic) ...
                uploadedFile = null;
                engineeringFileLoaded = false;
                fileList.innerHTML = '';
                fileElem.value = ''; 
                updateEngineeringCardState();
                
                engineeringInputGroup.style.display = 'flex';
                dropArea.style.display = 'flex';
                engineeringPreviewContainer.style.display = 'none';

            } else if (systemName === 'enterprise-systems') { 
                
                if (action === 'reset-all') {
                    // Fully reset all enterprise integration states
                    integratedSystems = [];
                    
                    // Hide preview container, logic below handles showing dropdown
                    enterprisePreviewContainer.style.display = 'none';
                } 
                
                // COMMON RESET (For 'Integrate More' and after 'Reset All')
                
                // Show initial state selection container
                enterpriseInputGroup.style.display = 'flex'; 
                systemSelect.style.display = 'block';
                systemSelect.value = ''; // Reset dropdown
                
                // Hide module selection
                document.querySelectorAll('.module-group').forEach(group => {
                    group.style.display = 'none';
                    group.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
                });
                moduleSelectionContainer.style.display = 'none';
                moduleIntegrateBtn.disabled = true;
                apiInput.value = '';
                apiStatus.textContent = '';
                updateIntegratedSystemsDisplay(); 
            }
            updateProcessButtonState();
            resetStatus();
        });
    });


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

    // Initial check for button state
    updateProcessButtonState(); 
});
