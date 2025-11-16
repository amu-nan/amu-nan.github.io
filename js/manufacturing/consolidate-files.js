// --- MODAL INTERACTION LOGIC ---
const modal = document.getElementById('systemConfigModal');
const openBtn = document.getElementById('openSystemModalBtn');
const closeBtn = document.getElementById('closeSystemModal');
const systemSelectOptions = document.querySelectorAll('.system-select-option');
const integrateBtn = document.getElementById('integrateSystemBtn');
const moduleCheckboxes = document.querySelectorAll('#module-group-container input[type="checkbox"]');
const selectedSystemName = document.getElementById('selectedSystemName');
const moduleSelectionStep = document.getElementById('module-selection-step');
const systemTypeStep = document.getElementById('system-type-step');

let currentSystemType = '';

/**
 * Opens the system configuration modal and resets its state.
 */
openBtn.onclick = () => {
    modal.style.display = 'flex';
    // Reset modal state on open
    systemTypeStep.style.display = 'block';
    moduleSelectionStep.style.display = 'none';
    integrateBtn.disabled = true;
    document.getElementById('module-select-api').value = '';
    moduleCheckboxes.forEach(cb => cb.checked = false);
}

/**
 * Closes the system configuration modal.
 */
closeBtn.onclick = () => {
    modal.style.display = 'none';
}

/**
 * Closes the modal when clicking outside of it.
 */
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Step 1: System Selection Handler
systemSelectOptions.forEach(option => {
    option.onclick = () => {
        // Remove 'selected' class from all options
        systemSelectOptions.forEach(opt => opt.classList.remove('selected'));
        // Add 'selected' class to the clicked option
        option.classList.add('selected');
        
        currentSystemType = option.getAttribute('data-system-type');
        selectedSystemName.textContent = currentSystemType;

        // Move to step 2 (Module selection)
        systemTypeStep.style.display = 'none';
        moduleSelectionStep.style.display = 'block';
        
        // NOTE: In a real app, you would fetch and filter modules based on 'currentSystemType' here.
        // For this example, all modules are shown.
    }
});

// Step 2: Enable Integrate button when at least one module is selected
const updateIntegrateButtonState = () => {
    const checkedModules = document.querySelectorAll('#module-group-container input[type="checkbox"]:checked');
    integrateBtn.disabled = checkedModules.length === 0;
}

moduleCheckboxes.forEach(checkbox => {
    checkbox.onchange = updateIntegrateButtonState;
});

// --- DUMMY INTEGRATION LOGIC ---

/**
 * Simulates system integration and adds a new integrated card to the UI.
 */
integrateBtn.onclick = () => {
    const apiKey = document.getElementById('module-select-api').value.trim();
    const selectedModules = Array.from(document.querySelectorAll('#module-group-container input[type="checkbox"]:checked')).map(cb => cb.value);
    
    if (!apiKey) {
        alert("Please enter a System API Key/Identifier.");
        return;
    }

    console.log(`Integrating ${currentSystemType} with API Key: ${apiKey} and modules: ${selectedModules.join(', ')}`);
    
    // DUMMY: Simulate success and add the integrated card
    const integratedContainer = document.getElementById('integrated-systems-container');
    const moduleHtml = selectedModules.map(mod => {
        // Convert 'erp-inventory' to 'Inventory' for display
        const displayMod = mod.split('-').length > 1 ? mod.split('-')[1].charAt(0).toUpperCase() + mod.split('-')[1].slice(1) : mod;
        return `<li class="integrated-module"><i class="fas fa-check"></i> ${displayMod}</li>`;
    }).join('');

    const newCard = document.createElement('div');
    newCard.className = 'option-card integrated-system-card';
    newCard.setAttribute('data-system-type', currentSystemType);
    newCard.setAttribute('data-api-key', apiKey); // Store data for later processing
    newCard.setAttribute('data-modules', selectedModules.join(',')); // Store modules for later processing

    newCard.innerHTML = `
        <h2><i class="fas fa-link"></i> ${currentSystemType} - Connected</h2>
        <p>Modules integrated: ${selectedModules.length}. Key: ${apiKey.substring(0, 4)}...</p>
        <ul class="module-list-compact">${moduleHtml}</ul>
        <button class="reset-integration-btn">Reset Integration</button>
    `;
    integratedContainer.appendChild(newCard);
    
    // Add event listener to the new reset button
    newCard.querySelector('.reset-integration-btn').onclick = function() {
        newCard.remove();
        checkProcessButtonReadiness();
    };

    // Close modal and check process button status
    modal.style.display = 'none';
    checkProcessButtonReadiness();
}

// --- ENGINEERING FILE UPLOAD LOGIC ---
const engineeringFileInput = document.getElementById('engineeringFileInput');
const engineeringFileList = document.getElementById('engineering-file-list');
const engineeringPreviewArea = document.getElementById('engineering-preview-area');
const resetEngineeringUpload = document.getElementById('resetEngineeringUpload');
const dropZone = document.getElementById('dropZone');

engineeringFileInput.onchange = (e) => {
    handleFileUpload(e.target.files);
}

/**
 * Handles the file list display for the engineering card.
 * @param {FileList} files - The list of files to display.
 */
function handleFileUpload(files) {
    engineeringFileList.innerHTML = ''; // Clear existing
    if (files.length > 0) {
        for (const file of files) {
            const li = document.createElement('li');
            li.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            engineeringFileList.appendChild(li);
        }
        engineeringPreviewArea.style.display = 'block';
        dropZone.style.display = 'none';
    } else {
        engineeringPreviewArea.style.display = 'none';
        dropZone.style.display = 'flex'; // Show drop zone if no files
    }
    checkProcessButtonReadiness();
}

resetEngineeringUpload.onclick = () => {
    engineeringFileInput.value = ''; // Clear the input field
    handleFileUpload([]); // Clear the list
}

// --- Drag and Drop Handlers ---
dropZone.addEventListener('click', () => engineeringFileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('highlight');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('highlight');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('highlight');
    if (e.dataTransfer.files.length) {
        engineeringFileInput.files = e.dataTransfer.files;
        handleFileUpload(e.dataTransfer.files);
    }
});


// --- CONSOLIDATED PROCESS LOGIC ---
const processButton = document.getElementById('consolidateProcessBtn');
const processingStatus = document.getElementById('processingStatus');

/**
 * Checks if any system is integrated or any file is uploaded and updates the main button state.
 */
function checkProcessButtonReadiness() {
    const integratedSystems = document.querySelectorAll('.integrated-system-card').length > 0;
    const engineeringFiles = engineeringFileInput.files.length > 0;
    
    // Enable the button if EITHER an enterprise system is integrated OR an engineering file is uploaded.
    processButton.disabled = !(integratedSystems || engineeringFiles);
    
    // Reset button text after a process is potentially complete or disabled
    if (!processButton.disabled) {
        processButton.textContent = "Run Consolidated Process";
    }
}

/**
 * Main button click handler (Triggers all uploads and processes).
 */
processButton.onclick = async () => {
    if (processButton.disabled) return;

    // 1. Collect all integrated systems data
    const systemCards = document.querySelectorAll('.integrated-system-card');
    const integratedData = Array.from(systemCards).map(card => ({
        type: card.getAttribute('data-system-type'),
        apiKey: card.getAttribute('data-api-key'),
        modules: card.getAttribute('data-modules').split(','),
        // NOTE: This array contains the 7 potential upload targets
    }));

    // 2. Collect engineering files
    const engineeringFiles = engineeringFileInput.files;

    if (integratedData.length === 0 && engineeringFiles.length === 0) {
        alert("Please integrate at least one system or upload an engineering file.");
        return;
    }

    // Start processing animation
    processingStatus.style.display = 'block';
    processButton.textContent = "Processing Data...";
    processButton.disabled = true;

    console.log("Starting Consolidated Process...");
    console.log("Enterprise Data to process:", integratedData);
    console.log("Engineering Files count:", engineeringFiles.length);

    // --- REAL BACKEND INTEGRATION LOGIC GOES HERE ---
    
    // In a real application, you would iterate through integratedData and engineeringFiles
    // and make the 7+ distinct Supabase POST calls using the keys/files.
    // Example: 
    /*
    const uploadPromises = [];
    integratedData.forEach(data => {
        data.modules.forEach(moduleName => {
            // Find the correct FUNCTION_URL for this moduleName (e.g., crm-marketing -> marketing-upload)
            // uploadPromises.push(fetch(FUNCTION_URL_MAP[moduleName], ...));
        });
    });
    // uploadPromises.push(fetch(ENGINEERING_UPLOAD_URL, ...));
    
    // await Promise.all(uploadPromises);
    */

    // DUMMY: Simulate API call time
    await new Promise(resolve => setTimeout(resolve, 4000)); 

    // DUMMY: End processing animation
    processingStatus.style.display = 'none';
    processButton.textContent = "✅ Processing Complete!";
    
    // After a successful run, you might clear the file input and disable the button again
    // engineeringFileInput.value = '';
    // handleFileUpload([]);
    // checkProcessButtonReadiness(); 
}

// Initial check on load
checkProcessButtonReadiness();
