document.addEventListener('DOMContentLoaded', () => {
    // --- Get company name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');

    // --- References for State Management ---
    const initialStateContainer = document.getElementById('initial-state-container');
    const unifiedStateContainer = document.getElementById('unified-state-container');
    const pageTitle = document.getElementById('pageTitle');
    const unifiedTitle = document.getElementById('unifiedTitle');
    const tilesContainer = document.getElementById('tiles-container');

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
    const engineeringPreviewInfo = document.getElementById('engineering-preview-info');

    // --- References for Enterprise System Modal Workflow ---
    const addSystemTile = document.getElementById('add-enterprise-system-tile');
    const systemModal = document.getElementById('enterprise-system-modal');
    const moduleModal = document.getElementById('module-input-modal');
    const modalSystemSelect = document.getElementById('modal-system-select');
    const modalSelectSystemBtn = document.getElementById('modal-select-system-btn');
    const modalCloseButtons = document.querySelectorAll('.modal-close-btn');
    const moduleModalTitle = document.getElementById('module-modal-title');
    const modalApiInput = document.getElementById('modal-system-api-url');
    const modalApiStatus = document.getElementById('modal-api-connect-status');
    const modalIntegrateBtn = document.getElementById('modalIntegrateBtn');
    const moduleModalBackBtn = document.getElementById('module-modal-back-btn');
    const moduleFileElem = document.getElementById('moduleFileElem');
    const moduleFileList = document.getElementById('module-file-list');
    const modalModuleCheckboxes = document.querySelectorAll('#modal-module-selection-container input[type="checkbox"]');


    // **Backend Endpoint URL**
    const backendEndpointUrl = 'http://127.0.0.1:8000/upload_cad_pdf/'; // Kept for backend logic

    // State object to track uploads
    let uploadedFile = null; // Engineering file
    let engineeringFileLoaded = false;
    let integratedSystems = []; // Array to store integrated system objects
    let currentSystemIntegration = { // Temp object for current workflow
        system: '',
        name: '',
        modules: [],
        apiUrl: '',
        dataFile: null 
    };

    // --- Global helper to map system names for display ---
    const systemNameMap = {
        erp: 'ERP System',
        crm: 'CRM System',
        scm: 'SCM System',
        supplier_relations: 'Supplier Relations' // Added a module key for SCM
    };
    
    // --- Enterprise System Modules Data (for reusability) ---
    const moduleData = {
        erp: [
            { value: 'inventory', name: 'Inventory' },
            { value: 'procurement', name: 'Procurement' },
            { value: 'quality_control', name: 'Quality Control' },
            { value: 'production', name: 'Production' }
        ],
        crm: [
            { value: 'customers', name: 'Customers' },
            { value: 'leads', name: 'Leads' },
            { value: 'marketing', name: 'Marketing' },
            { value: 'opportunities', name: 'Opportunities' }
        ],
        scm: [
            { value: 'logistics', name: 'Logistics' },
            { value: 'warehouse', name: 'Warehouse Management' },
            { value: 'forecasting', name: 'Demand Forecasting' },
            { value: 'supplier_relations', name: 'Supplier Relations' }
        ]
    };


    // --- State and UI Management Functions ---

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

    function showModal(modal) {
        systemModal.style.display = 'none';
        moduleModal.style.display = 'none';
        modal.style.display = 'flex';
    }

    function hideModals() {
        systemModal.style.display = 'none';
        moduleModal.style.display = 'none';
    }

    // --- Engineering System File Handling (UNCHANGED BACKEND LOGIC) ---
    // ... (Your existing Engineering file handling logic: preventDefaults, dragenter/over/leave/drop listeners, handleFilesEngineering, displayFilesEngineering, updateEngineeringCardState, showEngineeringLocalLoading)
    
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

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDropEngineering(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFilesEngineering(files);
    }

    function showEngineeringLocalLoading(files, callback) {
        // Hide upload and API input
        document.querySelector('#engineering-tile .system-input-group').style.display = 'none';
        
        const tile = document.getElementById('engineering-tile');
        const spinnerHtml = `<div class="system-loading" id="engineering-loading-spinner"><div class="loading-spinner"></div><p>Processing Engineering data...</p></div>`;
        tile.insertAdjacentHTML('beforeend', spinnerHtml);
        
        setTimeout(() => {
            document.getElementById('engineering-loading-spinner')?.remove();
            // Restore input group display
            document.querySelector('#engineering-tile .system-input-group').style.display = 'flex';
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
        const engineeringTile = document.getElementById('engineering-tile');
        const connectInput = document.getElementById('engineering-url');
        const apiConnected = connectInput.value.length > 0;
        
        if (engineeringFileLoaded || apiConnected) {
            engineeringInputGroup.style.display = 'none';
            engineeringPreviewContainer.style.display = 'flex';
            if(engineeringFileLoaded) {
                engineeringPreviewInfo.textContent = `${uploadedFile.name} Uploaded.`;
            } else if (apiConnected) {
                engineeringPreviewInfo.textContent = `API Connected: ${connectInput.value.substring(0, 30)}...`;
            } else {
                 engineeringPreviewInfo.textContent = `Data Source Connected.`;
            }
            engineeringTile.classList.add('integrated');
        } else {
            engineeringInputGroup.style.display = 'flex';
            engineeringPreviewContainer.style.display = 'none';
            engineeringTile.classList.remove('integrated');
        }
    }
    
    document.querySelector('.engineering-connect-btn').addEventListener('click', () => {
        // Simulate loading
        showEngineeringLocalLoading(null, updateEngineeringCardState);
        updateProcessButtonState();
    });


    // --- DYNAMIC TILE MANAGEMENT ---

    function createIntegratedSystemTile(systemObject, index) {
        const icon = { erp: 'fa-cube', crm: 'fa-user-tie', scm: 'fa-truck' }[systemObject.system] || 'fa-cloud';
        const modulesHtml = systemObject.modules.map(mod => `<li><i class="fa-solid fa-check"></i> ${systemNameMap[mod] || mod}</li>`).join('');
        const apiStatus = systemObject.apiUrl && systemObject.apiUrl !== 'N/A' ? `API: ${systemObject.apiUrl.substring(0, 20)}...` : 'No API';
        const fileStatus = systemObject.dataFile ? `${systemObject.dataFile.name}` : 'No File Upload';

        const tile = document.createElement('div');
        tile.className = 'option-card integrated-system-tile';
        tile.id = `integrated-tile-${index}`;
        tile.setAttribute('data-system-type', systemObject.system);
        tile.innerHTML = `
            <h2><i class="fa-solid ${icon}"></i> ${systemObject.name} Integrated</h2>
            <p><strong>Status:</strong> Successfully connected and modules selected.</p>
            <div class="integrated-details">
                <p><strong>Data Source:</strong> ${apiStatus} | ${fileStatus}</p>
                <p><strong>Modules:</strong></p>
                <ul class="integrated-modules-list">${modulesHtml}</ul>
            </div>
            <button class="reset-system-btn" data-index="${index}"><i class="fa-solid fa-trash"></i> Remove</button>
        `;
        return tile;
    }

    function updateTilesContainer() {
        // 1. Clear existing integrated tiles
        document.querySelectorAll('.integrated-system-tile').forEach(tile => tile.remove());
        
        // 2. Insert integrated systems tiles before the 'Add' tile and 'Engineering' tile
        let lastIntegratedIndex = -1;
        integratedSystems.forEach((sys, index) => {
            const newTile = createIntegratedSystemTile(sys, index);
            tilesContainer.insertBefore(newTile, addSystemTile);
            lastIntegratedIndex = index;
        });
        
        // 3. Update the 'Add System' tile button/visibility
        if (integratedSystems.length >= 3) {
            addSystemTile.style.display = 'none';
        } else {
            addSystemTile.style.display = 'block';
            addSystemTile.innerHTML = `
                <h2><i class="fa-solid fa-plus-circle"></i> Integrate Another System</h2>
                <p>Click to add another system: ERP, CRM, or SCM.</p>
            `;
        }

        // 4. Update Engineering Tile Position (Ensure it's always at the end)
        const engineeringTile = document.getElementById('engineering-tile');
        tilesContainer.appendChild(engineeringTile);
        
        updateProcessButtonState();
    }
    
    // Add event listener for dynamic "Remove" buttons
    tilesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('reset-system-btn') || e.target.closest('.reset-system-btn')) {
            const btn = e.target.closest('.reset-system-btn');
            const index = parseInt(btn.getAttribute('data-index'));
            
            if (!isNaN(index)) {
                integratedSystems.splice(index, 1);
                updateTilesContainer();
            }
            if (integratedSystems.length === 0) {
                 addSystemTile.innerHTML = `<h2><i class="fa-solid fa-plus-circle"></i> Integrate Enterprise System</h2><p>Start by selecting a core system (ERP, CRM, SCM).</p>`;
            }
        }
    });


    // --- MODAL WORKFLOW LISTENERS ---
    
    // 1. Initial/Integrate Another System Tile Click
    addSystemTile.addEventListener('click', () => {
        currentSystemIntegration = { system: '', name: '', modules: [], apiUrl: '', dataFile: null };
        modalSystemSelect.value = '';
        modalSelectSystemBtn.disabled = true;
        showModal(systemModal);
    });

    // 2. System Select in Modal
    modalSystemSelect.addEventListener('change', function() {
        const system = this.value;
        modalSelectSystemBtn.disabled = !system;
        currentSystemIntegration.system = system;
        currentSystemIntegration.name = systemNameMap[system];
    });

    // 3. Move from System Select to Module Select
    modalSelectSystemBtn.addEventListener('click', () => {
        if (!currentSystemIntegration.system) return;

        // Reset module modal state
        modalModuleCheckboxes.forEach(checkbox => checkbox.checked = false);
        modalApiInput.value = '';
        moduleFileList.innerHTML = '';
        currentSystemIntegration.dataFile = null;
        modalIntegrateBtn.disabled = true;
        modalApiInput.placeholder = `e.g., https://api.${currentSystemIntegration.system}system.com/data`;
        
        // Hide all module groups
        document.querySelectorAll('.module-group').forEach(group => group.style.display = 'none');
        
        // Show the relevant module group
        const moduleGroup = document.getElementById(`modal-${currentSystemIntegration.system}-modules`);
        if (moduleGroup) {
            moduleGroup.style.display = 'flex';
        }

        moduleModalTitle.textContent = `Select Modules for ${currentSystemIntegration.name}`;
        showModal(moduleModal);
    });
    
    // 4. Handle Module Checkbox Change
    modalModuleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const selectedModules = Array.from(document.querySelectorAll(`#modal-${currentSystemIntegration.system}-modules input:checked`))
                                         .map(input => input.value);
            modalIntegrateBtn.disabled = selectedModules.length === 0;
            currentSystemIntegration.modules = selectedModules;
        });
    });
    
    // 5. Module File Upload (Single file per system integration)
    moduleFileElem.addEventListener('change', (e) => {
        const files = e.target.files;
        moduleFileList.innerHTML = '';
        if (files.length > 0) {
            currentSystemIntegration.dataFile = files[0];
            const li = document.createElement('li');
            li.innerHTML = `<span class="file-name"><i class="fa-solid fa-file-alt"></i> ${files[0].name} Added</span>`;
            moduleFileList.appendChild(li);
        } else {
            currentSystemIntegration.dataFile = null;
        }
    });

    // 6. Integrate Button Click (Finalize Integration)
    modalIntegrateBtn.addEventListener('click', function() {
        if (currentSystemIntegration.modules.length === 0) return;
        
        // Finalize currentSystemIntegration object
        currentSystemIntegration.apiUrl = modalApiInput.value || 'N/A';
        
        // Simulate integration
        moduleModalTitle.innerHTML = `<div class="loading-spinner"></div><p>Integrating ${currentSystemIntegration.name} data...</p>`;
        modalIntegrateBtn.disabled = true;

        setTimeout(() => {
            // Add or Update the system in the main array
            const existingIndex = integratedSystems.findIndex(sys => sys.system === currentSystemIntegration.system);
            if (existingIndex !== -1) {
                integratedSystems[existingIndex] = { ...currentSystemIntegration };
            } else {
                integratedSystems.push({ ...currentSystemIntegration });
            }

            hideModals();
            updateTilesContainer();
            updateProcessButtonState();
            
            // Re-render the initial add tile state if needed
            if (integratedSystems.length === 0) {
                 addSystemTile.innerHTML = `<h2><i class="fa-solid fa-plus-circle"></i> Integrate Enterprise System</h2><p>Start by selecting a core system (ERP, CRM, SCM).</p>`;
            }
            
        }, 1500);
    });

    // 7. Modal Close/Back Buttons
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', hideModals);
    });
    moduleModalBackBtn.addEventListener('click', () => {
        showModal(systemModal);
    });
    
    
    // --- Main Action Trigger for Unified Button (Keep existing) ---
    processButton.addEventListener('click', async () => {
        if (!engineeringFileLoaded && document.getElementById('engineering-url').value.length === 0) {
            alert('Please connect to an API or upload an Engineering Diagram to proceed.');
            return;
        }
        if (integratedSystems.length === 0) {
            alert('Please select and integrate at least one Enterprise System.');
            return;
        }

        // Simulating the combined data payload for the backend (though only the engineering file is posted)
        console.log('Final Integration Payload:', { 
            engineering: uploadedFile ? uploadedFile.name : 'API Connected',
            enterpriseSystems: integratedSystems 
        });

        processButton.style.display = 'none';
        processingInfo.style.display = 'block';
        unifyMessage.style.display = 'block';
        unifyMessage.textContent = `Now unifying data for ${companyName || 'your company'}... this may take a moment.`;
        successMessage.style.display = 'none';

        // NOTE: The backend upload logic for the Engineering file remains as is.
        // In a real application, you would also send the integratedSystems data.
        const formData = new FormData();
        if (uploadedFile) {
             formData.append('file', uploadedFile);
        } else {
             formData.append('api_url', document.getElementById('engineering-url').value);
        }
        formData.append('enterprise_systems', JSON.stringify(integratedSystems));

        try {
            // Only posting if a file exists, otherwise assume API call is handled separately or is successful
            const response = uploadedFile ? await fetch(backendEndpointUrl, {
                method: 'POST',
                body: formData,
            }) : { ok: true, json: async () => ({ status: 'success', message: 'API connected and systems unified' }) }; // Mock response for API-only

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Network response was not ok: ${text}`);
            }

            const data = await response.json();
            console.log('Data processed successfully:', data);
            
            processingInfo.style.display = 'none';
            unifyMessage.style.display = 'none';

            // Transition to unified state
            showUnifiedState();

            const newUrl = `${window.location.pathname}?company=${encodeURIComponent(companyName)}&unified=true`;
            history.pushState({}, '', newUrl);

        } catch (error) {
            console.error('Unification error:', error);
            processingInfo.style.display = 'none';
            unifyMessage.style.display = 'none';
            successMessage.textContent = `Error: ${error.message}`;
            successMessage.style.color = 'red';
            successMessage.style.display = 'block';
            processButton.style.display = 'block';
        }
    });
    
    // --- Initial Load State Functions ---
    function showInitialState() {
        if (companyName) {
            pageTitle.textContent = `Unify Data for ${companyName}`;
        }
        initialStateContainer.style.display = 'block';
        unifiedStateContainer.style.display = 'none';
        resetStatus();
        updateTilesContainer();
    }

    function showUnifiedState() {
        if (companyName) {
            unifiedTitle.textContent = `${companyName}'s Data is Unified`;
        }
        initialStateContainer.style.display = 'none';
        unifiedStateContainer.style.display = 'block';
        chatButton.href = `conversation-ai.html?company=${encodeURIComponent(companyName)}`;
    }


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
    const isUnified = urlParams.get('unified');
    if (isUnified === 'true') {
        showUnifiedState();
    } else {
        showInitialState();
    }
});
