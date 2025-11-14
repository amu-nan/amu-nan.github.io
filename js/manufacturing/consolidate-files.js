document.addEventListener('DOMContentLoaded', () => {
    // --- System Definitions (NEW) ---
    const systemModules = {
        erp: {
            icon: 'fa-industry',
            modules: ['Inventory', 'Procurement', 'Quality Control', 'Production']
        },
        crm: {
            icon: 'fa-handshake',
            modules: ['Customers', 'Leads', 'Marketing', 'Opportunities']
        },
        scm: {
            icon: 'fa-truck-fast',
            modules: ['Logistics', 'Warehousing', 'Supplier Management', 'Forecasting']
        }
    };

    // --- State Management (NEW & MODIFIED) ---
    let integratedSystems = []; // Array to store { system: 'erp', modules: ['Inventory', 'Procurement'] }
    let currentSystemConfig = {}; // For the system currently being configured in the modal
    
    let uploadedFile = null;
    let engineeringFileLoaded = false; // Retained from original logic

    // --- References for State Management ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');
    const initialStateContainer = document.getElementById('initial-state-container');
    const unifiedStateContainer = document.getElementById('unified-state-container');
    const pageTitle = document.getElementById('pageTitle');
    const unifiedTitle = document.getElementById('unifiedTitle');
    const integratedSystemsContainer = document.getElementById('integrated-systems-container');

    // --- References for Engineering (Retained) ---
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileList = document.getElementById('file-list');
    const engineeringInputGroup = document.getElementById('engineering-input-group');
    const engineeringPreviewContainer = document.getElementById('engineering-preview-container');

    // --- References for Modals (NEW) ---
    const addNewSystemCard = document.getElementById('add-new-system-card');
    const systemSelectorModal = document.getElementById('system-selector-modal');
    const moduleConfigModal = document.getElementById('module-config-modal');
    const closeSystemSelector = document.getElementById('close-system-selector');
    const closeModuleConfig = document.getElementById('close-module-config');
    const systemSelectOptions = document.querySelectorAll('.system-select-option');
    const modulesList = document.getElementById('modules-list');
    const nextToDataBtn = document.getElementById('next-to-data-btn');
    const integrateSystemBtn = document.getElementById('integrate-system-btn');
    const moduleSelectionArea = document.getElementById('module-selection-area');
    const moduleDataArea = document.getElementById('module-data-area');
    const moduleDataInputs = document.getElementById('module-data-inputs');

    // --- References for Process Button (Retained) ---
    const processButton = document.getElementById('processButton');
    const processingInfo = document.getElementById('processing-info');
    const unifyMessage = document.getElementById('unify-message');
    const successMessage = document.getElementById('success-message');
    const backendEndpointUrl = 'http://127.0.0.1:8000/upload_cad_pdf/';
    const chatButton = document.getElementById('chatButton');

    // --- Initialization ---
    const isUnified = urlParams.get('unified');
    if (isUnified === 'true') {
        showUnifiedState();
    } else {
        showInitialState();
    }
    updateProcessButtonState();
    
    // --- General UI/State Functions (Modified/Retained) ---

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
        // AND at least one other system is integrated.
        const canProcess = engineeringFileLoaded && integratedSystems.length > 0;
        processButton.disabled = !canProcess;
        // Show the button if at least the Engineering file is loaded (Original logic kept)
        processButton.style.display = engineeringFileLoaded ? 'block' : 'none'; 
    }

    function resetStatus() {
        processingInfo.style.display = 'none';
        unifyMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // --- Dynamic Tile Rendering (NEW) ---

    function renderIntegratedSystems() {
        integratedSystemsContainer.innerHTML = '';
        
        integratedSystems.forEach((systemConfig, index) => {
            const systemKey = systemConfig.system;
            const systemDetails = systemModules[systemKey];
            const systemDisplay = systemKey.toUpperCase();
            const moduleListHtml = systemConfig.modules.map(mod => 
                `<li class="integrated-module"><i class="fa-solid fa-circle-dot"></i> ${mod}</li>`
            ).join('');
            
            const tileHtml = `
                <div class="option-card integrated-system-card" data-system="${systemKey}" data-index="${index}">
                    <h2><i class="fa-solid ${systemDetails.icon}"></i> ${systemDisplay} Integrated</h2>
                    <p>Modules & Data Sources Added:</p>
                    <ul class="module-list-compact">${moduleListHtml}</ul>
                    <button class="reset-integration-btn" data-index="${index}">Remove</button>
                </div>
            `;
            integratedSystemsContainer.insertAdjacentHTML('beforeend', tileHtml);
        });

        // Re-attach listeners for dynamically added remove buttons
        document.querySelectorAll('.reset-integration-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                integratedSystems.splice(index, 1); // Remove from state
                renderIntegratedSystems(); // Re-render the tiles
                updateProcessButtonState();
            });
        });

        // Hide the "Add New System" card if ERP, CRM, and SCM are all integrated.
        const integratedKeys = integratedSystems.map(s => s.system);
        const allIntegrated = ['erp', 'crm', 'scm'].every(key => integratedKeys.includes(key));
        addNewSystemCard.style.display = allIntegrated ? 'none' : 'flex';
    }

    // --- System Selection Modal Logic (NEW) ---

    document.getElementById('open-system-selector').addEventListener('click', () => {
        // Filter out systems that are already integrated from the selector buttons
        const integratedKeys = integratedSystems.map(s => s.system);
        systemSelectOptions.forEach(btn => {
            const systemKey = btn.getAttribute('data-system');
            if (integratedKeys.includes(systemKey)) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'block';
            }
        });

        systemSelectorModal.style.display = 'flex';
    });

    closeSystemSelector.addEventListener('click', () => {
        systemSelectorModal.style.display = 'none';
    });

    systemSelectOptions.forEach(button => {
        button.addEventListener('click', (e) => {
            const system = e.currentTarget.getAttribute('data-system');
            currentSystemConfig = { system: system, modules: [], dataConfig: {} };
            systemSelectorModal.style.display = 'none';
            openModuleConfig(system);
        });
    });

    // --- Module Configuration Modal Logic (NEW) ---

    function openModuleConfig(system) {
        const systemDisplay = system.toUpperCase();
        const { icon, modules } = systemModules[system];
        
        document.getElementById('system-name-placeholder').textContent = systemDisplay;

        // Reset to module selection view
        moduleSelectionArea.style.display = 'block';
        moduleDataArea.style.display = 'none';
        nextToDataBtn.disabled = true;

        // Populate module buttons
        modulesList.innerHTML = '';
        modules.forEach(moduleName => {
            const moduleBtn = document.createElement('button');
            moduleBtn.classList.add('module-select-option');
            moduleBtn.setAttribute('data-module', moduleName);
            moduleBtn.innerHTML = `<i class="fa-solid fa-cube"></i> ${moduleName}`;
            moduleBtn.addEventListener('click', toggleModuleSelection);
            modulesList.appendChild(moduleBtn);
        });

        moduleConfigModal.style.display = 'flex';
    }

    closeModuleConfig.addEventListener('click', () => {
        moduleConfigModal.style.display = 'none';
        currentSystemConfig = {};
    });

    function toggleModuleSelection(e) {
        const button = e.currentTarget;
        const moduleName = button.getAttribute('data-module');

        if (button.classList.contains('selected')) {
            // Deselect
            button.classList.remove('selected');
            currentSystemConfig.modules = currentSystemConfig.modules.filter(m => m !== moduleName);
            delete currentSystemConfig.dataConfig[moduleName];
        } else {
            // Select
            button.classList.add('selected');
            currentSystemConfig.modules.push(moduleName);
            currentSystemConfig.dataConfig[moduleName] = { file: null, api: '' };
        }
        
        nextToDataBtn.disabled = currentSystemConfig.modules.length === 0;
    }

    nextToDataBtn.addEventListener('click', () => {
        moduleSelectionArea.style.display = 'none';
        moduleDataArea.style.display = 'block';
        integrateSystemBtn.disabled = true;
        renderModuleDataInputs();
    });

    function renderModuleDataInputs() {
        moduleDataInputs.innerHTML = '';
        
        currentSystemConfig.modules.forEach(moduleName => {
            const moduleKey = moduleName.toLowerCase().replace(/\s/g, '-');
            const dataInputHtml = `
                <div class="module-data-group" data-module="${moduleName}">
                    <h5>${moduleName} Data Source</h5>
                    
                    <div class="data-input-api">
                        <label for="${moduleKey}-api">Connect to API:</label>
                        <input type="url" id="${moduleKey}-api" placeholder="e.g., https://api.mysystem.com/${moduleKey}" data-module-name="${moduleName}" class="module-api-input">
                        <button class="integration-btn module-connect-btn"><i class="fa-solid fa-plug"></i> Connect</button>
                    </div>
                    
                    <div class="file-upload-box local-upload module-drop-area" id="${moduleKey}-drop-area">
                        <i class="fa-solid fa-upload"></i>
                        <p>Load ${moduleName} Data File</p>
                        <p class="file-upload-info">Click or drag and drop files here (.csv, .xlsx, .xls)</p>
                        <input type="file" id="${moduleKey}-file" multiple accept=".csv, .xlsx, .xls" class="file-input module-file-input" data-module-name="${moduleName}">
                        <ul class="file-list" id="${moduleKey}-file-list"></ul>
                    </div>
                    <div class="module-preview-container" style="display:none;">
                        <span class="preview-text">Data Loaded: <span id="${moduleKey}-filename"></span></span>
                        <button class="reset-module-upload-btn" data-module-name="${moduleName}">Change</button>
                    </div>
                </div>
            `;
            moduleDataInputs.insertAdjacentHTML('beforeend', dataInputHtml);
        });

        // Attach listeners for data inputs and file uploads
        setupModuleDataListeners();
    }
    
    function setupModuleDataListeners() {
        document.querySelectorAll('.module-file-input').forEach(input => {
            const moduleName = input.getAttribute('data-module-name');
            const dropArea = input.closest('.module-drop-area');

            // File input change
            input.addEventListener('change', (e) => handleModuleFile(moduleName, e.target.files));
            
            // Drag/Drop setup
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, preventDefaults, false);
            });
            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
            });
            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
            });
            dropArea.addEventListener('drop', (e) => handleModuleFile(moduleName, e.dataTransfer.files));
            dropArea.addEventListener('click', () => input.click());
        });
        
        document.querySelectorAll('.module-api-input').forEach(input => {
             // API input change - this is purely visual, no actual API call here
            input.addEventListener('input', (e) => {
                const moduleName = e.target.getAttribute('data-module-name');
                currentSystemConfig.dataConfig[moduleName].api = e.target.value.trim();
                checkModuleDataStatus();
            });
        });

        document.querySelectorAll('.reset-module-upload-btn').forEach(button => {
            button.addEventListener('click', (e) => resetModuleData(e.target.getAttribute('data-module-name')));
        });
        
        checkModuleDataStatus(); // Initial check
    }
    
    function handleModuleFile(moduleName, files) {
        if (files.length > 0) {
            const file = files[0];
            currentSystemConfig.dataConfig[moduleName].file = file.name;
            
            // Visual update
            const moduleKey = moduleName.toLowerCase().replace(/\s/g, '-');
            const dataGroup = document.querySelector(`.module-data-group[data-module="${moduleName}"]`);
            const dropArea = dataGroup.querySelector('.module-drop-area');
            const previewContainer = dataGroup.querySelector('.module-preview-container');
            const filenameSpan = dataGroup.querySelector(`#${moduleKey}-filename`);

            dropArea.style.display = 'none';
            previewContainer.style.display = 'flex';
            filenameSpan.textContent = file.name;
        } else {
            currentSystemConfig.dataConfig[moduleName].file = null;
        }
        checkModuleDataStatus();
    }
    
    function resetModuleData(moduleName) {
        currentSystemConfig.dataConfig[moduleName].file = null;
        
        const moduleKey = moduleName.toLowerCase().replace(/\s/g, '-');
        const dataGroup = document.querySelector(`.module-data-group[data-module="${moduleName}"]`);
        const dropArea = dataGroup.querySelector('.module-drop-area');
        const previewContainer = dataGroup.querySelector('.module-preview-container');
        const fileInput = dataGroup.querySelector('.module-file-input');

        // Clear file input value
        fileInput.value = '';
        
        dropArea.style.display = 'flex';
        previewContainer.style.display = 'none';
        
        checkModuleDataStatus();
    }
    
    function checkModuleDataStatus() {
        let allModulesReady = true;
        
        currentSystemConfig.modules.forEach(moduleName => {
            const config = currentSystemConfig.dataConfig[moduleName];
            // Ready if a file is loaded OR an API URL is entered
            if (!config.file && !config.api) {
                allModulesReady = false;
            }
        });
        
        integrateSystemBtn.disabled = !allModulesReady;
    }

    integrateSystemBtn.addEventListener('click', () => {
        // 1. Add the configured system to the state
        integratedSystems.push(currentSystemConfig);
        
        // 2. Clear the configuration
        currentSystemConfig = {};
        
        // 3. Close the modal
        moduleConfigModal.style.display = 'none';
        
        // 4. Update the main page UI
        renderIntegratedSystems();
        updateProcessButtonState();
        
        // Re-open system selector immediately if not all 3 systems are integrated.
        // This simulates the "plus tile saying integrate one more" behavior.
        const integratedKeys = integratedSystems.map(s => s.system);
        const allIntegrated = ['erp', 'crm', 'scm'].every(key => integratedKeys.includes(key));
        if (!allIntegrated) {
             document.getElementById('open-system-selector').click();
        }
    });

    // --- Engineering System File Handling (Retained, slightly cleaned up) ---
    // Engineering functions (preventDefaults, handleDropEngineering, handleFilesEngineering, 
    // displayFilesEngineering, updateEngineeringCardState, reset upload) are **retained** // from your original logic to ensure the backend integration path remains intact. 
    // They are simply omitted here for brevity but should be included in the final JS file.

    // Engineering System File Handling (Retained)
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
    
    function showLocalLoading(system, files, callback) {
        // Placeholder for loading visual logic
        const systemInputGroup = document.getElementById(system + '-input-group') || engineeringInputGroup;
        const systemDropArea = document.getElementById(system + 'DropArea') || dropArea;
        
        systemDropArea.style.display = 'none';
        
        const spinnerHtml = `<div class="system-loading"><div class="loading-spinner"></div><p>Processing data...</p></div>`;
        systemInputGroup.insertAdjacentHTML('beforeend', spinnerHtml);
        
        setTimeout(() => {
            const spinner = systemInputGroup.querySelector('.system-loading');
            if (spinner) spinner.remove();

            if (system === 'engineering') {
               systemDropArea.style.display = 'flex';
            }

            callback();
        }, 2000);
    }

    function handleDropEngineering(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFilesEngineering(files);
    }

    function handleFilesEngineering(files) {
        uploadedFile = files.length > 0 ? files[0] : null;
        engineeringFileLoaded = uploadedFile !== null;
        
        if (engineeringFileLoaded) {
            const system = { name: 'engineering', dropArea: dropArea, inputGroup: engineeringInputGroup };
            showLocalLoading('engineering', files, () => {
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

    // --- Main Action Trigger for Engineering Diagram (Unified Button) (Retained) ---
    processButton.addEventListener('click', async () => {
         // ... (Original processButton logic for Engineering System) ...
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
        // Note: The integratedSystems array (ERP, CRM, SCM data) would ideally 
        // also be included in a real production environment. For this example, 
        // we keep the Engineering Diagram backend logic as requested.
        
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

    // --- Reset Functionality for all cards (Retained/Modified) ---
    document.querySelectorAll('.reset-upload-btn[data-system="engineering"]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Reset Engineering state
            uploadedFile = null;
            engineeringFileLoaded = false;
            fileList.innerHTML = '';
            fileElem.value = ''; // Clear file input
            updateEngineeringCardState();
            
            const engSystem = { inputGroup: engineeringInputGroup, dropArea: dropArea, previewContainer: engineeringPreviewContainer };
            engSystem.inputGroup.style.display = 'flex';
            engSystem.dropArea.style.display = 'flex';
            engSystem.previewContainer.style.display = 'none';
            
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

    // Initial render of dynamic systems
    renderIntegratedSystems();
});
