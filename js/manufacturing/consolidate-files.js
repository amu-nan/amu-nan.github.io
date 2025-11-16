document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const mainOptionsGrid = document.getElementById('main-options-grid');
    const enterpriseModulesSection = document.getElementById('enterprise-modules-section');
    const engineeringDiagramSection = document.getElementById('engineering-diagram-section');
    const backToMainButtons = document.querySelectorAll('.back-to-main-btn');

    // Enterprise System Buttons
    const beginEnterpriseBtn = document.getElementById('begin-enterprise-integration');
    const moduleCards = document.querySelectorAll('.module-card');
    const integrateModuleBtns = document.querySelectorAll('.integrate-module-btn');
    const resetModuleBtns = document.querySelectorAll('.reset-module-btn');
    const enterpriseIntegratedList = document.getElementById('enterprise-integrated-list');
    
    // Engineering Upload Elements
    const beginEngineeringBtn = document.getElementById('begin-engineering-integration');
    const fileUploadBox = document.getElementById('file-upload-box');
    const fileInput = document.getElementById('file-input');
    const uploadedFileList = document.getElementById('uploaded-file-list');
    const resetEngineeringUploadBtn = document.getElementById('reset-engineering-upload');
    const engineeringUploadStatus = document.getElementById('engineering-upload-status');
    const engineeringUploadCount = document.getElementById('engineering-upload-count');

    // Global Process Button
    const startConsolidationBtn = document.getElementById('start-consolidation-btn');

    // --- STATE VARIABLES ---
    let integratedModules = new Set();
    let uploadedFiles = [];

    // --- NAVIGATION LOGIC ---

    /**
     * Switches the view between the main grid and a sub-section.
     * @param {HTMLElement} targetSection - The section to show (e.g., enterpriseModulesSection).
     */
    function showSection(targetSection) {
        // Hide all major sections
        mainOptionsGrid.style.display = 'none';
        enterpriseModulesSection.style.display = 'none';
        engineeringDiagramSection.style.display = 'none';

        // Show the target section
        if (targetSection) {
            targetSection.style.display = 'block';
        } else {
            // If target is null, show the main grid
            mainOptionsGrid.style.display = 'grid';
        }
    }

    // Event listeners for section switching
    beginEnterpriseBtn.addEventListener('click', () => showSection(enterpriseModulesSection));
    beginEngineeringBtn.addEventListener('click', () => showSection(engineeringDiagramSection));
    
    backToMainButtons.forEach(btn => {
        btn.addEventListener('click', () => showSection(null));
    });


    // --- CONSOLIDATION STATUS UPDATE ---

    /**
     * Updates the main process button based on the current state.
     */
    function updateConsolidationStatus() {
        const sourceCount = integratedModules.size + (uploadedFiles.length > 0 ? 1 : 0);

        startConsolidationBtn.textContent = `Start Consolidation (${sourceCount} Sources Ready)`;
        startConsolidationBtn.disabled = sourceCount === 0;

        // Update the visual status on the engineering tile
        engineeringUploadStatus.style.display = uploadedFiles.length > 0 ? 'block' : 'none';
        engineeringUploadCount.textContent = uploadedFiles.length;
    }

    // --- ENTERPRISE MODULE LOGIC ---

    function renderIntegratedModules() {
        enterpriseIntegratedList.innerHTML = '';
        if (integratedModules.size === 0) {
            document.getElementById('integrated-systems-list').style.display = 'none';
            beginEnterpriseBtn.textContent = 'Select Modules';
            return;
        }

        integratedModules.forEach(moduleId => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<i class="fas fa-check-circle"></i> ${moduleId.charAt(0).toUpperCase() + moduleId.slice(1)} Module`;
            enterpriseIntegratedList.appendChild(listItem);
        });

        document.getElementById('integrated-systems-list').style.display = 'block';
        beginEnterpriseBtn.textContent = `Integrated (${integratedModules.size})`;
    }

    // Handle Module Integration Button Click
    integrateModuleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const moduleId = e.target.dataset.moduleId;
            integratedModules.add(moduleId);
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex'; // Show preview container
            updateConsolidationStatus();
            renderIntegratedModules();
        });
    });

    // Handle Module Reset Button Click
    resetModuleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const moduleId = e.target.dataset.moduleId;
            integratedModules.delete(moduleId);
            const integrateBtn = e.target.closest('.module-card').querySelector('.integrate-module-btn');
            
            integrateBtn.style.display = 'block';
            e.target.closest('.module-preview-container').style.display = 'none';

            updateConsolidationStatus();
            renderIntegratedModules();
        });
    });

    // --- ENGINEERING UPLOAD LOGIC ---

    function handleFiles(files) {
        // Simple file validation (e.g., max 10 files)
        if (uploadedFiles.length + files.length > 10) {
            alert("Maximum 10 files allowed for upload.");
            return;
        }

        for (const file of files) {
            // Simple type check (though 'accept' handles most of this)
            if (file.name.match(/\.(dwg|pdf|stp)$/i)) {
                uploadedFiles.push(file);
            } else {
                alert(`File type not supported: ${file.name}`);
            }
        }
        renderUploadedFiles();
        updateConsolidationStatus();
    }

    function renderUploadedFiles() {
        uploadedFileList.innerHTML = '';
        if (uploadedFiles.length === 0) {
            fileUploadBox.style.display = 'flex';
            resetEngineeringUploadBtn.style.display = 'none';
        } else {
            fileUploadBox.style.display = 'none';
            resetEngineeringUploadBtn.style.display = 'block';
            uploadedFiles.forEach(file => {
                const listItem = document.createElement('li');
                listItem.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                uploadedFileList.appendChild(listItem);
            });
        }
    }

    // Click to open file dialog
    fileUploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        // Clear input value to allow selecting same file again
        fileInput.value = ''; 
    });

    // Drag and Drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadBox.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    fileUploadBox.addEventListener('dragenter', () => fileUploadBox.classList.add('highlight'), false);
    fileUploadBox.addEventListener('dragover', () => fileUploadBox.classList.add('highlight'), false);
    fileUploadBox.addEventListener('dragleave', () => fileUploadBox.classList.remove('highlight'), false);
    fileUploadBox.addEventListener('drop', (e) => {
        fileUploadBox.classList.remove('highlight');
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }, false);

    // Reset Uploads
    resetEngineeringUploadBtn.addEventListener('click', () => {
        uploadedFiles = [];
        renderUploadedFiles();
        updateConsolidationStatus();
    });


    // --- MAIN CONSOLIDATION PROCESS ---

    startConsolidationBtn.addEventListener('click', () => {
        if (startConsolidationBtn.disabled) return;

        // Gather final data summary
        const dataSummary = {
            integratedModules: Array.from(integratedModules),
            uploadedFileNames: uploadedFiles.map(file => file.name),
            totalFiles: uploadedFiles.length
        };

        console.log('Starting Consolidation with Data:', dataSummary);

        // Visual feedback for processing
        startConsolidationBtn.style.display = 'none';
        document.getElementById('processing-info').style.display = 'block';

        // Simulate a network request/processing delay
        setTimeout(() => {
            document.getElementById('processing-info').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';

            // Log the success and the consolidated data
            console.log("Consolidation successful!");
            
            // In a real application, you would now offer a download link or move to an analysis page.

        }, 3000); // 3-second delay
    });

    // --- INITIALIZATION ---
    renderUploadedFiles(); // Ensure initial state is correct
    renderIntegratedModules(); // Ensure initial state is correct
    updateConsolidationStatus(); // Set initial button state
});
