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
    const integratedSummary = document.getElementById('integrated-summary');

    // **Backend Endpoint URL**
    const backendEndpointUrl = 'http://127.0.0.1:8000/upload_cad_pdf/';
    
    // State object to track uploads
    let uploadedFile = null;
    let engineeringFileLoaded = false;
    let enterpriseModulesLoaded = false; // NEW state for combined card
    let selectedEnterpriseSystem = '';
    let selectedModules = [];

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
        // Enable if BOTH engineering file AND enterprise modules are loaded
        const canProcess = engineeringFileLoaded && enterpriseModulesLoaded;
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

    // --- Engineering System File Handling (Existing Logic Retained) ---

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
        // Hide file upload box and display the spinner temporarily
        dropArea.style.display = 'none';
        
        const spinnerHtml = `<div class="system-loading" id="engineering-loading-spinner"><div class="loading-spinner"></div><p>Processing Engineering data...</p></div>`;
        engineeringInputGroup.insertAdjacentHTML('beforeend', spinnerHtml);
        
        setTimeout(() => {
            // Remove spinner
            document.getElementById('engineering-loading-spinner')?.remove();
            // Restore drop area for engineering
            dropArea.style.display = 'flex';
            // Execute the callback to show the success state (image preview)
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
        if (!enterpriseModulesLoaded) {
             alert('Please select and integrate Enterprise System Modules to proceed.');
            return;
        }

        processButton.style.display = 'none';
        processingInfo.style.display = 'block';
        unifyMessage.style.display = 'block';
        unifyMessage.textContent = `Now unifying data for ${companyName || 'your company'}... this may take a moment.`;
        successMessage.style.display = 'none';

        const formData = new FormData();
        formData.append('file', uploadedFile);
        // NOTE: We don't send the selected enterprise modules to the current backend endpoint, 
        // as the requirement was to keep the backend logic "as is" and the module selection is visual.
        // If the backend needed this info, it would be appended here:
        // formData.append('enterprise_system', selectedEnterpriseSystem);
        // formData.append('modules', JSON.stringify(selectedModules)); 

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

    // --- Enterprise System Dropdown and Module Selection Logic (NEW) ---

    systemSelect.addEventListener('change', function() {
        selectedEnterpriseSystem = this.value;
        const moduleGroups = document.querySelectorAll('.module-group');
        
        // Hide all module groups and module container initially
        moduleGroups.forEach(group => {
            group.style.display = 'none';
            // Uncheck all modules when system changes
            group.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        });
        moduleSelectionContainer.style.display = 'none';

        // Show the relevant module group
        if (selectedEnterpriseSystem) {
            document.getElementById(`${selectedEnterpriseSystem}-modules`).style.display = 'block';
            moduleSelectionContainer.style.display = 'block';
        }
        
        // Reset state and button
        selectedModules = [];
        moduleIntegrateBtn.disabled = true;
        enterpriseModulesLoaded = false;
        enterprisePreviewContainer.style.display = 'none';
        enterpriseInputGroup.style.display = 'block'; // Ensure the selection dropdown is visible
        systemSelect.style.display = 'block';
        updateProcessButtonState();
    });

    // Listener for module checkboxes
    enterpriseModuleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Only consider checkboxes in the currently selected module group
            const currentModuleGroup = document.getElementById(`${selectedEnterpriseSystem}-modules`);
            
            if (currentModuleGroup) {
                selectedModules = Array.from(currentModuleGroup.querySelectorAll('input:checked'))
                                       .map(input => input.value);
                
                moduleIntegrateBtn.disabled = selectedModules.length === 0;
            }
        });
    });

    moduleIntegrateBtn.addEventListener('click', function() {
        if (selectedModules.length > 0) {
            
            // 1. Hide selection, show loading spinner
            moduleSelectionContainer.style.display = 'none';
            systemSelect.style.display = 'none';
            
            const spinnerHtml = `<div class="system-loading" id="enterprise-loading-spinner"><div class="loading-spinner"></div><p>Integrating **${selectedEnterpriseSystem.toUpperCase()}** modules...</p></div>`;
            enterpriseInputGroup.insertAdjacentHTML('beforeend', spinnerHtml);

            // Simulate a 2-second integration (visual-only)
            setTimeout(() => {
                // 2. Remove loading
                document.getElementById('enterprise-loading-spinner')?.remove();

                // 3. Update state and show success preview
                enterpriseModulesLoaded = true;
                
                integratedSummary.innerHTML = `**System:** ${selectedEnterpriseSystem.toUpperCase()}<br>**Modules:** ${selectedModules.join(', ')}`;
                
                enterpriseInputGroup.style.display = 'none'; // Hide the entire input group (dropdowns)
                enterprisePreviewContainer.style.display = 'flex';
                
                updateProcessButtonState();
            }, 2000); 
        } else {
            alert('Please select at least one module to integrate.');
        }
    });

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
                
                engineeringInputGroup.style.display = 'flex';
                dropArea.style.display = 'flex';
                engineeringPreviewContainer.style.display = 'none';

            } else if (systemName === 'enterprise-systems') { 
                // Reset Enterprise System state
                enterpriseModulesLoaded = false;
                selectedEnterpriseSystem = '';
                selectedModules = [];
                
                // Reset UI
                systemSelect.value = '';
                systemSelect.style.display = 'block'; // Show dropdown again
                moduleSelectionContainer.style.display = 'none';
                enterprisePreviewContainer.style.display = 'none';
                enterpriseInputGroup.style.display = 'block'; // Show input group container
                
                // Hide and uncheck all modules
                document.querySelectorAll('.module-group').forEach(group => {
                    group.style.display = 'none';
                    group.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
                });
                moduleIntegrateBtn.disabled = true;
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
