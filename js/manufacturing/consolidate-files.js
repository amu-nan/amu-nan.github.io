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
            
            // Show appropriate panel
            if (type === 'enterprise') {
                enterprisePanel.style.display = 'block';
            } else if (type === 'engineering') {
                engineeringPanel.style.display = 'block';
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
            
            // Show tiles again
            document.querySelector('.integration-tiles').style.display = 'grid';
            
            resetStatus();
        });
    });

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
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                enterpriseModuleFiles[system][module] = file;
                
                // Show loading state
                statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
                statusEl.style.color = '#3498db';
                statusEl.style.display = 'block';
                
                // Simulate processing (2 seconds)
                setTimeout(() => {
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
        const hasAnyFile = Object.values(currentModules).some(file => file !== null);
        enterpriseProcessBtn.disabled = !hasAnyFile;
    }

    // --- Enterprise Data Processing ---
    enterpriseProcessBtn.addEventListener('click', async () => {
        const currentModules = enterpriseModuleFiles[currentEnterpriseSystem];
        const filesToUpload = Object.entries(currentModules).filter(([_, file]) => file !== null);
        
        if (filesToUpload.length === 0) {
            alert('Please upload at least one module file.');
            return;
        }

        // Hide panel and show processing
        enterprisePanel.style.display = 'none';
        processingInfo.style.display = 'block';
        unifyMessage.style.display = 'block';
        unifyMessage.textContent = `Processing ${currentEnterpriseSystem.toUpperCase()} data for ${companyName || 'your company'}... this may take a moment.`;
        successMessage.style.display = 'none';

        try {
            // Process each file (currently simulated, will use actual endpoints when ready)
            const uploadPromises = filesToUpload.map(([module, file]) => {
                return simulateEnterpriseUpload(currentEnterpriseSystem, module, file);
            });

            await Promise.all(uploadPromises);

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
            enterprisePanel.style.display = 'block';
        }
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

        engineeringPanel.style.display = 'none';
        processingInfo.style.display = 'block';
        unifyMessage.style.display = 'block';
        unifyMessage.textContent = `Processing engineering diagram for ${companyName || 'your company'}... this may take a moment.`;
        successMessage.style.display = 'none';

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            // BACKEND LOGIC REMAINS THE SAME
            const response = await fetch(ENGINEERING_ENDPOINT, {
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
            engineeringPanel.style.display = 'block';
        }
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
});
