document.addEventListener('DOMContentLoaded', () => {
    // --- Get company name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');

    // --- References for State Management ---
    const initialStateContainer = document.getElementById('initial-state-container');
    const unifiedStateContainer = document.getElementById('unified-state-container');
    const pageTitle = document.getElementById('pageTitle');
    const unifiedTitle = document.getElementById('unifiedTitle');

    // --- References for Integration Tiles and Panels ---
    const integrationTiles = document.querySelectorAll('.integration-tile');
    const beginIntegrationBtns = document.querySelectorAll('.begin-integration-btn');
    const enterprisePanel = document.getElementById('enterprise-panel');
    const engineeringPanel = document.getElementById('engineering-panel');
    const cancelBtns = document.querySelectorAll('.cancel-btn');

    // --- References for Engineering System ---
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileList = document.getElementById('file-list');
    const engineeringProcessBtn = document.getElementById('engineering-process-btn');
    const processingInfo = document.getElementById('processing-info');
    const unifyMessage = document.getElementById('unify-message');
    const successMessage = document.getElementById('success-message');

    // --- References for Enterprise System ---
    const systemBtns = document.querySelectorAll('.system-btn');
    const erpModules = document.getElementById('erp-modules');
    const crmModules = document.getElementById('crm-modules');
    const enterpriseProcessBtn = document.getElementById('enterprise-process-btn');
    const moduleCountSpan = document.getElementById('module-count');

    // --- References for Progress Tracker ---
    const progressSteps = document.querySelectorAll('.progress-step');

    // --- References for Integration Summary ---
    const integrationSummary = document.getElementById('integration-summary');
    const erpSummaryCard = document.getElementById('erp-summary');
    const crmSummaryCard = document.getElementById('crm-summary');
    const engineeringSummaryCard = document.getElementById('engineering-summary');
    const erpDetails = document.getElementById('erp-details');
    const crmDetails = document.getElementById('crm-details');
    const engineeringDetails = document.getElementById('engineering-details');
    const addErpBtn = document.getElementById('add-erp-btn');
    const addCrmBtn = document.getElementById('add-crm-btn');
    const addEngineeringBtn = document.getElementById('add-engineering-btn');
    const unifyAllBtn = document.getElementById('unify-all-btn');
    const cancelSummaryBtn = document.querySelector('.cancel-summary-btn');

    // **Backend Endpoint URLs**
    const ENGINEERING_ENDPOINT = 'http://127.0.0.1:8000/upload_cad_pdf/';
    
    // Supabase endpoints for enterprise modules (placeholders for now)
    const ENTERPRISE_ENDPOINTS = {
        erp: {
            inventory: 'https://aqasfpkazrebatjhdhig.supabase.co/functions/v1/erp-inventory-upload',
            procurement: 'https://aqasfpkazrebatjhdhig.supabase.co/functions/v1/erp-procurement-upload',
            quality: 'https://aqasfpkazrebatjhdhig.supabase.co/functions/v1/erp-quality-upload',
            production: 'https://aqasfpkazrebatjhdhig.supabase.co/functions/v1/erp-production-upload'
        },
        crm: {
            customers: 'https://aqasfpkazrebatjhdhig.supabase.co/functions/v1/crm-customers-upload',
            leads: 'https://aqasfpkazrebatjhdhig.supabase.co/functions/v1/crm-leads-upload',
            marketing: 'https://aqasfpkazrebatjhdhig.supabase.co/functions/v1/crm-marketing-upload',
            opportunities: 'https://aqasfpkazrebatjhdhig.supabase.co/functions/v1/crm-opportunities-upload'
        }
    };

    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxYXNmcGthenJlYmF0amhkaGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTMxMDYsImV4cCI6MjA3ODUyOTEwNn0.F18jn7ug3VD1g05NMxxa9Dp9YnSZycge4ekyb94GyYc";

    // State object to track uploads
    let uploadedFile = null;
    let currentEnterpriseSystem = 'erp';
    let enterpriseModuleFiles = {
        erp: { inventory: null, procurement: null, quality: null, production: null },
        crm: { customers: null, leads: null, marketing: null, opportunities: null }
    };
    
    // Track what's been integrated
    let integratedSystems = {
        erp: false,
        crm: false,
        engineering: false
    };
    let erpModuleCount = 0;
    let crmModuleCount = 0;

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

    function resetStatus() {
        processingInfo.style.display = 'none';
        unifyMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // --- Integration Tile Click Handlers ---
    beginIntegrationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            
            // Hide tiles
            document.querySelector('.integration-tiles').style.display = 'none';
            
            // Update progress tracker
            updateProgressStep(2);
            
            // Show appropriate panel
            if (type === 'enterprise') {
                // If ERP already integrated, switch to CRM view, otherwise show ERP
                if (integratedSystems.erp && !integratedSystems.crm) {
                    currentEnterpriseSystem = 'crm';
                    systemBtns.forEach(b => b.classList.remove('active'));
                    document.querySelector('[data-system="crm"]').classList.add('active');
                    erpModules.style.display = 'none';
                    crmModules.style.display = 'block';
                } else {
                    currentEnterpriseSystem = 'erp';
                }
                enterprisePanel.style.display = 'block';
            } else if (type === 'engineering') {
                engineeringPanel.style.display = 'block';
            }
            
            resetStatus();
        });
    });

    // --- Panel Back Button Handlers ---
    document.querySelectorAll('.panel-back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Hide all panels
            enterprisePanel.style.display = 'none';
            engineeringPanel.style.display = 'none';
            
            // Check if anything has been integrated already
            if (integratedSystems.erp || integratedSystems.crm || integratedSystems.engineering) {
                // Go back to summary if something is already integrated
                showIntegrationSummary();
            } else {
                // Go back to tiles if nothing is integrated yet
                document.querySelector('.integration-tiles').style.display = 'grid';
                updateProgressStep(1);
            }
            
            resetStatus();
        });
    });

    // --- Cancel Button Handlers ---
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Hide all panels
            enterprisePanel.style.display = 'none';
            engineeringPanel.style.display = 'none';
            
            // Check if anything has been integrated already
            if (integratedSystems.erp || integratedSystems.crm || integratedSystems.engineering) {
                // Go back to summary if something is already integrated
                showIntegrationSummary();
            } else {
                // Go back to tiles if nothing is integrated yet
                document.querySelector('.integration-tiles').style.display = 'grid';
                updateProgressStep(1);
            }
            
            resetStatus();
        });
    });

    // --- Progress Tracker Update Function ---
    function updateProgressStep(step) {
        progressSteps.forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.remove('active', 'completed');
            
            if (stepNumber < step) {
                stepEl.classList.add('completed');
            } else if (stepNumber === step) {
                stepEl.classList.add('active');
            }
        });
    }

    // --- Enterprise System Selector ---
    systemBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            systemBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Get selected system
            currentEnterpriseSystem = btn.getAttribute('data-system');
            
            // Show/hide appropriate modules
            if (currentEnterpriseSystem === 'erp') {
                erpModules.style.display = 'block';
                crmModules.style.display = 'none';
            } else {
                erpModules.style.display = 'none';
                crmModules.style.display = 'block';
            }
            
            updateEnterpriseProcessBtn();
        });
    });

    // --- Enterprise Module File Upload Handlers ---
    function setupModuleUpload(system, module) {
        const fileInput = document.getElementById(`${system}-${module}-file`);
        const uploadLabel = fileInput.nextElementSibling;
        const statusEl = uploadLabel.nextElementSibling;
        const moduleCard = fileInput.closest('.module-card');
        const moduleStatus = moduleCard.querySelector('.module-status');
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                enterpriseModuleFiles[system][module] = file;
                
                // Update module status to uploading
                moduleStatus.setAttribute('data-status', 'uploading');
                
                // Show loading state
                statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
                statusEl.style.color = '#3498db';
                statusEl.style.display = 'block';
                
                // Simulate processing (2 seconds)
                setTimeout(() => {
                    moduleStatus.setAttribute('data-status', 'complete');
                    statusEl.innerHTML = '<i class="fa-solid fa-check-circle"></i> File loaded successfully';
                    statusEl.style.color = '#27ae60';
                    uploadLabel.innerHTML = `<i class="fa-solid fa-check"></i> ${file.name}`;
                    uploadLabel.style.backgroundColor = '#27ae60';
                    
                    updateEnterpriseProcessBtn();
                }, 2000);
            }
        });
    }

    // Setup all module uploads
    ['inventory', 'procurement', 'quality', 'production'].forEach(module => {
        setupModuleUpload('erp', module);
    });
    ['customers', 'leads', 'marketing', 'opportunities'].forEach(module => {
        setupModuleUpload('crm', module);
    });

    function updateEnterpriseProcessBtn() {
        const currentModules = enterpriseModuleFiles[currentEnterpriseSystem];
        const filesArray = Object.values(currentModules).filter(file => file !== null);
        const hasAnyFile = filesArray.length > 0;
        
        enterpriseProcessBtn.disabled = !hasAnyFile;
        
        // Update module count
        if (moduleCountSpan) {
            moduleCountSpan.textContent = filesArray.length;
        }
    }

    // --- Enterprise Data Processing ---
    enterpriseProcessBtn.addEventListener('click', async () => {
        const currentModules = enterpriseModuleFiles[currentEnterpriseSystem];
        const filesToUpload = Object.entries(currentModules).filter(([_, file]) => file !== null);
        
        if (filesToUpload.length === 0) {
            alert('Please upload at least one module file.');
            return;
        }

        // Mark current system as integrated
        if (currentEnterpriseSystem === 'erp') {
            integratedSystems.erp = true;
            erpModuleCount = filesToUpload.length;
        } else if (currentEnterpriseSystem === 'crm') {
            integratedSystems.crm = true;
            crmModuleCount = filesToUpload.length;
        }

        // Hide panel and show summary
        enterprisePanel.style.display = 'none';
        showIntegrationSummary();
    });

    // Simulated upload function (replace with actual fetch when backend is ready)
    async function simulateEnterpriseUpload(system, module, file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Uploaded ${system}/${module}:`, file.name);
                resolve({ success: true, system, module, file: file.name });
            }, 1000);
        });
    }

    // Function for actual enterprise upload (use when backend is ready)
    async function uploadEnterpriseFile(system, module, file) {
        const endpoint = ENTERPRISE_ENDPOINTS[system][module];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ANON_KEY}`,
                'apikey': ANON_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Upload failed for ${system}/${module}: ${text}`);
        }

        return await response.json();
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
        displayFilesEngineering();
        updateEngineeringProcessBtn();
        resetStatus();
    }

    function displayFilesEngineering() {
        fileList.innerHTML = '';
        if (uploadedFile) {
            const li = document.createElement('li');
            li.innerHTML = `<span class="file-name"><i class="fa-solid fa-file-pdf"></i> ${uploadedFile.name} Loaded</span>`;
            fileList.appendChild(li);
        }
    }

    function updateEngineeringProcessBtn() {
        engineeringProcessBtn.disabled = !uploadedFile;
    }

    // --- Engineering Diagram Processing (Original Backend Logic) ---
    engineeringProcessBtn.addEventListener('click', async () => {
        if (!uploadedFile) {
            alert('Please upload an Engineering Diagram to proceed.');
            return;
        }

        // Mark as integrated
        integratedSystems.engineering = true;

        // Hide panel and show summary
        engineeringPanel.style.display = 'none';
        showIntegrationSummary();
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

    // --- Integration Summary Functions ---
    function showIntegrationSummary() {
        // Hide tiles and panels
        document.querySelector('.integration-tiles').style.display = 'none';
        enterprisePanel.style.display = 'none';
        engineeringPanel.style.display = 'none';
        
        // Update progress
        updateProgressStep(2);
        
        // Show summary panel
        integrationSummary.style.display = 'block';
        
        // Update ERP summary if integrated
        if (integratedSystems.erp) {
            erpSummaryCard.style.display = 'block';
            erpDetails.innerHTML = `
                <div class="summary-detail-item">
                    <i class="fa-solid fa-check"></i>
                    <span>ERP System - ${erpModuleCount} module(s) integrated</span>
                </div>
            `;
        } else {
            erpSummaryCard.style.display = 'none';
        }
        
        // Update CRM summary if integrated
        if (integratedSystems.crm) {
            crmSummaryCard.style.display = 'block';
            crmDetails.innerHTML = `
                <div class="summary-detail-item">
                    <i class="fa-solid fa-check"></i>
                    <span>CRM System - ${crmModuleCount} module(s) integrated</span>
                </div>
            `;
        } else {
            crmSummaryCard.style.display = 'none';
        }
        
        // Update engineering summary if integrated
        if (integratedSystems.engineering) {
            engineeringSummaryCard.style.display = 'block';
            engineeringDetails.innerHTML = `
                <div class="summary-detail-item">
                    <i class="fa-solid fa-check"></i>
                    <span>${uploadedFile.name}</span>
                </div>
            `;
        } else {
            engineeringSummaryCard.style.display = 'none';
        }
        
        // Update button text based on what's integrated
        if (integratedSystems.erp) {
            addErpBtn.innerHTML = '<i class="fa-solid fa-edit"></i> Modify ERP System';
        } else {
            addErpBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add ERP System';
        }
        
        if (integratedSystems.crm) {
            addCrmBtn.innerHTML = '<i class="fa-solid fa-edit"></i> Modify CRM System';
        } else {
            addCrmBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add CRM System';
        }
        
        if (integratedSystems.engineering) {
            addEngineeringBtn.innerHTML = '<i class="fa-solid fa-edit"></i> Modify Engineering Diagram';
        } else {
            addEngineeringBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Engineering Diagram';
        }
    }

    // Add more ERP system button
    addErpBtn.addEventListener('click', () => {
        integrationSummary.style.display = 'none';
        currentEnterpriseSystem = 'erp';
        // Switch to ERP view
        systemBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-system="erp"]').classList.add('active');
        erpModules.style.display = 'block';
        crmModules.style.display = 'none';
        enterprisePanel.style.display = 'block';
    });

    // Add more CRM system button
    addCrmBtn.addEventListener('click', () => {
        integrationSummary.style.display = 'none';
        currentEnterpriseSystem = 'crm';
        // Switch to CRM view
        systemBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-system="crm"]').classList.add('active');
        erpModules.style.display = 'none';
        crmModules.style.display = 'block';
        enterprisePanel.style.display = 'block';
    });

    // Add more engineering system button
    addEngineeringBtn.addEventListener('click', () => {
        integrationSummary.style.display = 'none';
        engineeringPanel.style.display = 'block';
    });

    // Modify buttons
    document.querySelectorAll('.modify-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.closest('.modify-btn').getAttribute('data-type');
            integrationSummary.style.display = 'none';
            
            if (type === 'erp') {
                currentEnterpriseSystem = 'erp';
                systemBtns.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-system="erp"]').classList.add('active');
                erpModules.style.display = 'block';
                crmModules.style.display = 'none';
                enterprisePanel.style.display = 'block';
            } else if (type === 'crm') {
                currentEnterpriseSystem = 'crm';
                systemBtns.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-system="crm"]').classList.add('active');
                erpModules.style.display = 'none';
                crmModules.style.display = 'block';
                enterprisePanel.style.display = 'block';
            } else if (type === 'engineering') {
                engineeringPanel.style.display = 'block';
            }
        });
    });

    // Cancel summary - start over
    cancelSummaryBtn.addEventListener('click', () => {
        // Reset all state
        integratedSystems = { erp: false, crm: false, engineering: false };
        erpModuleCount = 0;
        crmModuleCount = 0;
        uploadedFile = null;
        enterpriseModuleFiles = {
            erp: { inventory: null, procurement: null, quality: null, production: null },
            crm: { customers: null, leads: null, marketing: null, opportunities: null }
        };
        
        // Reset module status indicators
        document.querySelectorAll('.module-status').forEach(status => {
            status.setAttribute('data-status', 'pending');
        });
        
        // Reset upload labels and status messages
        document.querySelectorAll('.upload-label').forEach(label => {
            label.innerHTML = '<i class="fa-solid fa-upload"></i> Upload File';
            label.style.backgroundColor = '#3498db';
        });
        document.querySelectorAll('.upload-status').forEach(status => {
            status.style.display = 'none';
            status.innerHTML = '';
        });
        
        // Reset file inputs
        document.querySelectorAll('.module-upload .file-input').forEach(input => {
            input.value = '';
        });
        fileElem.value = '';
        fileList.innerHTML = '';
        
        // Reset UI
        integrationSummary.style.display = 'none';
        erpSummaryCard.style.display = 'none';
        crmSummaryCard.style.display = 'none';
        engineeringSummaryCard.style.display = 'none';
        document.querySelector('.integration-tiles').style.display = 'grid';
        
        // Reset progress
        updateProgressStep(1);
    });

    // Unify All Data button - BACKEND PROCESSING HAPPENS HERE
    unifyAllBtn.addEventListener('click', async () => {
        if (!integratedSystems.erp && !integratedSystems.crm && !integratedSystems.engineering) {
            alert('Please integrate at least one system before unifying.');
            return;
        }

        // Update progress to step 3
        updateProgressStep(3);

        // Hide summary and show processing
        integrationSummary.style.display = 'none';
        processingInfo.style.display = 'block';
        unifyMessage.style.display = 'block';
        unifyMessage.textContent = `Now unifying all data for ${companyName || 'your company'}... this may take a moment.`;
        successMessage.style.display = 'none';

        try {
            // Process ERP data if available
            if (integratedSystems.erp) {
                const erpModules = enterpriseModuleFiles.erp;
                const erpFilesToUpload = Object.entries(erpModules).filter(([_, file]) => file !== null);
                
                const erpUploadPromises = erpFilesToUpload.map(([module, file]) => {
                    return simulateEnterpriseUpload('erp', module, file);
                });
                
                await Promise.all(erpUploadPromises);
            }

            // Process CRM data if available
            if (integratedSystems.crm) {
                const crmModules = enterpriseModuleFiles.crm;
                const crmFilesToUpload = Object.entries(crmModules).filter(([_, file]) => file !== null);
                
                const crmUploadPromises = crmFilesToUpload.map(([module, file]) => {
                    return simulateEnterpriseUpload('crm', module, file);
                });
                
                await Promise.all(crmUploadPromises);
            }

            // Process engineering data if available - ORIGINAL BACKEND LOGIC
            if (integratedSystems.engineering && uploadedFile) {
                const formData = new FormData();
                formData.append('file', uploadedFile);

                const response = await fetch(ENGINEERING_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Network response was not ok: ${text}`);
                }

                const data = await response.json();
                console.log('Engineering file processed successfully:', data);
            }

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
            integrationSummary.style.display = 'block';
            updateProgressStep(2);
        }
    });
});
