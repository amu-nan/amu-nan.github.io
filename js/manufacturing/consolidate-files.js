document.addEventListener('DOMContentLoaded', () => {
    // --- Get company name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');

    // --- References for State Management ---
    const initialStateContainer = document.getElementById('initial-state-container');
    const unifiedStateContainer = document.getElementById('unified-state-container');
    const pageTitle = document.getElementById('pageTitle');
    const unifiedTitle = document.getElementById('unifiedTitle');
    const optionsGrid = document.getElementById('optionsGrid'); // New reference

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
    const engineeringCard = document.getElementById('engineering-card'); // New reference

    // --- References for Enterprise System (New Dropdown Logic) ---
    const enterpriseIntegrationCard = document.getElementById('enterprise-integration-card');
    const enterpriseInputGroup = document.getElementById('enterprise-input-group');
    const enterpriseIntroText = document.getElementById('enterprise-intro-text');
    const systemSelect = document.getElementById('system-select');
    const moduleSelectionContainer = document.getElementById('module-selection-container');
    const moduleIntegrateBtn = document.getElementById('moduleIntegrateBtn');
    const enterpriseModuleCheckboxes = document.querySelectorAll('.module-group input[type="checkbox"]');
    const enterprisePreviewContainer = document.getElementById('enterprise-preview-container');
    const integratedSystemsList = document.getElementById('integrated-systems-list'); // This is the old list wrapper, will now hold cards.
    const integrateMoreCard = document.getElementById('integrate-more-card'); // New reference for the plus tile

    const apiInput = document.getElementById('system-api-url');
    const apiStatus = document.getElementById('api-connect-status');
    const moduleFileContainer = document.getElementById('module-file-uploads'); // New reference

    // **Backend Endpoint URL**
    const backendEndpointUrl = 'http://127.0.0.1:8000/upload_cad_pdf/';
    
    // State object to track uploads
    let uploadedFile = null;
    let engineeringFileLoaded = false;
    let integratedSystems = []; // Array to store integrated system objects
    let selectedEnterpriseSystem = '';
    
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
        renderInitialGrid(); // New initial grid rendering
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
    // (Retained logic for drag/drop, file handling, and updateEngineeringCardState)
    // ... (All existing Engineering file handling logic here) ...
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
            // Note: dropArea visibility is controlled by updateEngineeringCardState now
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

        // Add integrated systems data to formData or handle separately if backend needs a different structure
        formData.append('integrated_systems', JSON.stringify(integratedSystems));

        try {
            // NOTE: The backend logic for the engineering diagram must remain the same and work as is.
            const response = await fetch(backendEndpointUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Network response was not ok: ${text}`);
            }

            const data = await response.json();
            console.log('Files and systems processed successfully:', data);
            
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

    // --- Enterprise System Dropdown and Module Selection Logic ---
    
    function updateApiPlaceholder(system) {
        let placeholder = 'e.g., https://api.mysystem.com/data';
        if (system === 'erp') placeholder = 'e.g., https://api.sap.com/data/v1/sales';
        if (system === 'crm') placeholder = 'e.g., https://api.salesforce.com/services';
        if (system === 'scm') placeholder = 'e.g., https://api.oracle.com/supplychain';
        apiInput.placeholder = placeholder;
        apiStatus.textContent = '';
        apiInput.value = '';
    }

    function renderIntegratedSystemCard(sys, index) {
        // Create a tile (option-card) for an integrated system
        const card = document.createElement('div');
        card.className = 'option-card integrated-card';
        card.setAttribute('data-system', sys.system);
        card.innerHTML = `
            <h2><i class="fa-solid fa-check-circle"></i> ${sys.name} Integrated</h2>
            <p>Integrated Modules: <strong>${sys.modules.length}</strong></p>
            <ul class="module-summary-list">
                ${sys.modules.map(mod => `<li><i class="fa-solid fa-list-check"></i> ${mod.charAt(0).toUpperCase() + mod.slice(1).replace('_', ' ')}</li>`).join('')}
            </ul>
            <p class="api-summary">API: ${sys.apiUrl === 'N/A' ? 'Not Used' : `<i class="fa-solid fa-plug"></i> Connected`}</p>
        `;
        return card;
    }

    function renderInitialGrid() {
        optionsGrid.innerHTML = '';
        
        // 1. Render all integrated system tiles
        integratedSystems.forEach((sys, index) => {
            optionsGrid.appendChild(renderIntegratedSystemCard(sys, index));
        });

        // 2. Determine which main Enterprise card to show/hide
        if (integratedSystems.length > 0) {
            // Hide the main integration form, show the "Integrate One More" tile
            enterpriseInputGroup.style.display = 'none';
            enterprisePreviewContainer.style.display = 'none';
            enterpriseIntegrationCard.style.display = 'none';
            
            // Render the "Integrate One More" tile
            integrateMoreCard.style.display = 'block';
            optionsGrid.appendChild(integrateMoreCard);

        } else {
            // Show the main integration form
            enterpriseIntegrationCard.style.display = 'block';
            enterpriseInputGroup.style.display = 'flex';
            enterprisePreviewContainer.style.display = 'none';
            integrateMoreCard.style.display = 'none';
            optionsGrid.appendChild(enterpriseIntegrationCard);
        }

        // 3. Always render the Engineering tile last
        optionsGrid.appendChild(engineeringCard);
        updateProcessButtonState();
    }

    function generateModuleFileInputs() {
        moduleFileContainer.innerHTML = '';
        const currentModuleGroup = document.getElementById(`${selectedEnterpriseSystem}-modules`);

        if (currentModuleGroup) {
            const selectedModules = Array.from(currentModuleGroup.querySelectorAll('input:checked'))
                                     .map(input => ({
                                         value: input.value,
                                         name: input.parentElement.textContent.trim()
                                     }));

            if (selectedModules.length > 0) {
                const title = document.createElement('h4');
                title.textContent = "Data Source for Modules (Optional)";
                moduleFileContainer.appendChild(title);
                
                selectedModules.forEach(mod => {
                    const fileInputDiv = document.createElement('div');
                    fileInputDiv.className = 'module-file-input';
                    fileInputDiv.innerHTML = `
                        <label for="file-${mod.value}">${mod.name} Data File (.csv/.xlsx):</label>
                        <input type="file" id="file-${mod.value}" data-module="${mod.value}" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
                        <span class="file-status" id="status-${mod.value}">No file uploaded</span>
                    `;
                    moduleFileContainer.appendChild(fileInputDiv);
                });
            }
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
        moduleFileContainer.innerHTML = ''; // Clear file uploads

        if (selectedEnterpriseSystem) {
            updateApiPlaceholder(selectedEnterpriseSystem);
            
            document.getElementById(`${selectedEnterpriseSystem}-modules`).style.display = 'flex';
            moduleSelectionContainer.style.display = 'flex';
        }
        
        // Reset state for module integration
        moduleIntegrateBtn.disabled = true;
    });

    enterpriseModuleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const currentModuleGroup = document.getElementById(`${selectedEnterpriseSystem}-modules`);
            
            if (currentModuleGroup) {
                const selectedModules = Array.from(currentModuleGroup.querySelectorAll('input:checked')).length;
                moduleIntegrateBtn.disabled = !(selectedModules > 0);
                
                // Regenerate file input options based on selected modules
                generateModuleFileInputs();
            }
            apiStatus.textContent = ''; // Clear status on interaction
            apiStatus.style.color = 'inherit';
        });
    });

    // New event listener for module file selection
    moduleFileContainer.addEventListener('change', function(e) {
        if (e.target.type === 'file') {
            const moduleName = e.target.getAttribute('data-module');
            const statusElement = document.getElementById(`status-${moduleName}`);
            
            if (e.target.files.length > 0) {
                statusElement.textContent = `File: ${e.target.files[0].name} ready`;
                statusElement.style.color = 'green';
            } else {
                statusElement.textContent = 'No file uploaded';
                statusElement.style.color = 'inherit';
            }
        }
    });

    apiInput.addEventListener('input', function() {
        const currentModuleGroup = document.getElementById(`${selectedEnterpriseSystem}-modules`);
        if (currentModuleGroup) {
            const modulesSelected = Array.from(currentModuleGroup.querySelectorAll('input:checked')).length > 0;
            moduleIntegrateBtn.disabled = !(modulesSelected);
        }
        apiStatus.textContent = '';
        apiStatus.style.color = 'inherit';
    });

    moduleIntegrateBtn.addEventListener('click', function() {
        const currentModuleGroup = document.getElementById(`${selectedEnterpriseSystem}-modules`);
        
        if (!currentModuleGroup) return;

        const modulesData = Array.from(currentModuleGroup.querySelectorAll('input:checked'))
                               .map(input => {
                                   const fileInput = document.getElementById(`file-${input.value}`);
                                   return {
                                       value: input.value,
                                       file: fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : 'N/A'
                                   };
                               });

        if (modulesData.length > 0) {
            const api = apiInput.value || 'N/A'; // API is optional
            
            // Basic validation if the user did input something in the API field
            if (apiInput.value && apiInput.value.length < 5) {
                apiStatus.textContent = 'API URL is too short. Please enter a valid URL or leave blank.';
                apiStatus.style.color = 'red';
                return;
            }

            const existingIndex = integratedSystems.findIndex(sys => sys.system === selectedEnterpriseSystem);
            
            const systemObject = {
                system: selectedEnterpriseSystem,
                name: systemNameMap[selectedEnterpriseSystem],
                modules: modulesData.map(m => m.value), // Store module values
                moduleFiles: modulesData.filter(m => m.file !== 'N/A').map(m => ({ module: m.value, file: m.file })), // Store files
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
            enterpriseIntroText.style.display = 'none';
            
            const spinnerHtml = `<div class="system-loading" id="enterprise-loading-spinner"><div class="loading-spinner"></div><p>Integrating <strong>${systemObject.name}</strong> data...</p></div>`;
            enterpriseInputGroup.insertAdjacentHTML('beforeend', spinnerHtml);

            // Simulate a 2-second integration
            setTimeout(() => {
                document.getElementById('enterprise-loading-spinner')?.remove();
                
                // 2. Update state and render the new grid
                renderInitialGrid();
                
                // Reset the form for next use
                systemSelect.value = '';
                apiInput.value = '';
                moduleFileContainer.innerHTML = '';
                enterpriseIntroText.style.display = 'block';
                systemSelect.style.display = 'block';

            }, 2000);
        }
    });

    // --- Reset/Integrate Another Functionality (FIXED) ---
    // Use event delegation for dynamically created buttons
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.reset-upload-btn, .integrate-more-btn');
        if (!button) return;

        e.preventDefault();
        const systemName = button.getAttribute('data-system');
        const action = button.getAttribute('data-action');
        
        if (systemName === 'engineering') {
            // Engineering Reset Logic (remains the same)
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
                integratedSystems = [];
            }
            
            // COMMON RESET (For 'Integrate More' and after 'Reset All')
            
            // Show the main integration form card
            enterpriseIntegrationCard.style.display = 'block';
            enterpriseInputGroup.style.display = 'flex';
            enterprisePreviewContainer.style.display = 'none'; // Not used in this version but good practice
            
            // Hide all module groups and reset dropdown
            document.querySelectorAll('.module-group').forEach(group => {
                group.style.display = 'none';
                group.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
            });
            moduleSelectionContainer.style.display = 'none';
            moduleIntegrateBtn.disabled = true;
            apiInput.value = '';
            apiStatus.textContent = '';
            systemSelect.value = '';
            moduleFileContainer.innerHTML = '';

            renderInitialGrid(); // Re-render the grid to show the main card and hide the "Integrate One More" card
        }
        updateProcessButtonState();
        resetStatus();
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
