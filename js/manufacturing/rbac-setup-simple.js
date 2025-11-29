// RBAC Setup Page JavaScript - Single Table Version
// This version works with the simplified single-table backend

// ============================================
// BACKEND CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:8000'; // Your FastAPI backend
// For production: const API_BASE_URL = 'https://api.xforiacoast.com';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown menu logic (from existing page)
    initializeDropdown();

    // Get company name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company') || 'Your Organization';
    document.getElementById('companyNameDisplay').textContent = companyName;

    // Store company name in configuration
    const setupConfig = {
        companyName: companyName
    };

    // Multi-step form management
    let currentStep = 1;
    const totalSteps = 5;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeBtn');

    // Navigation event listeners
    nextBtn.addEventListener('click', () => navigateStep(1));
    prevBtn.addEventListener('click', () => navigateStep(-1));
    completeBtn.addEventListener('click', completeSetup);

    // Initialize first step
    updateStepDisplay();

    // ============================================
    // NAVIGATION FUNCTIONS
    // ============================================

    function navigateStep(direction) {
        // Validate current step before moving forward
        if (direction > 0 && !validateCurrentStep()) {
            return;
        }

        // Save current step data
        saveCurrentStepData();

        // Update step number
        currentStep += direction;
        
        // Ensure we stay within bounds
        if (currentStep < 1) currentStep = 1;
        if (currentStep > totalSteps) currentStep = totalSteps;

        updateStepDisplay();
    }

    function updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.setup-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.getElementById(`step${currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update progress bar
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        document.getElementById('progressFill').style.width = progressPercentage + '%';

        // Update progress step indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        // Update navigation buttons
        prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
        completeBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';

        // If on review step, populate review section
        if (currentStep === 5) {
            populateReview();
        }
    }

    function validateCurrentStep() {
        console.log('Validating step:', currentStep);
        
        switch (currentStep) {
            case 1:
                // Check if at least one active system (ERP or CRM) is selected
                const systems = ['erpSystem', 'crmSystem'];
                const hasSelection = systems.some(id => {
                    const element = document.getElementById(id);
                    const value = element ? element.value : '';
                    console.log(`${id}:`, value);
                    return value !== '';
                });
                
                if (!hasSelection) {
                    alert('Please select at least one enterprise app (ERP or CRM) to continue.');
                    return false;
                }
                console.log('Step 1 validation passed');
                return true;

            case 2:
                console.log('Step 2 validation passed (optional)');
                return true;

            case 3:
                console.log('Step 3 validation passed');
                return true;

            case 4:
                console.log('Step 4 validation passed');
                return true;

            default:
                return true;
        }
    }

    function saveCurrentStepData() {
        switch (currentStep) {
            case 1:
                saveEnterpriseAppsData();
                break;
            case 2:
                saveNetworkIntegrationData();
                break;
            case 3:
                saveSecurityComplianceData();
                break;
            case 4:
                saveRolesData();
                break;
        }
    }

    // ============================================
    // DATA COLLECTION FUNCTIONS (Simplified for Single Table)
    // ============================================

    function saveEnterpriseAppsData() {
        // Only save active systems (ERP and CRM)
        const erpSelect = document.getElementById('erpSystem');
        const crmSelect = document.getElementById('crmSystem');
        
        setupConfig.erpVendor = erpSelect && erpSelect.value ? erpSelect.value : null;
        setupConfig.crmVendor = crmSelect && crmSelect.value ? crmSelect.value : null;

        console.log('Enterprise apps saved:', {
            erp: setupConfig.erpVendor,
            crm: setupConfig.crmVendor
        });
    }

    function saveNetworkIntegrationData() {
        setupConfig.netbiosDomain = document.getElementById('netbiosDomain').value.trim() || null;
        setupConfig.deploymentType = document.getElementById('deploymentType').value;
        setupConfig.smtpServer = document.getElementById('smtpServer').value.trim() || null;
        setupConfig.smtpPort = document.getElementById('smtpPort').value ? parseInt(document.getElementById('smtpPort').value) : null;
        setupConfig.smtpEncryption = document.getElementById('smtpEncryption').value || null;
        setupConfig.smtpSenderEmail = document.getElementById('senderEmail').value.trim() || null;
        setupConfig.smtpRequiresAuth = document.getElementById('smtpAuth').checked;
        setupConfig.productVersion = 'Xforia COAST v2.1.0';
        setupConfig.updatePreference = document.getElementById('updatePreference').value;
        setupConfig.betaFeaturesEnabled = document.getElementById('betaFeatures').checked;

        console.log('Network integration saved:', setupConfig);
    }

    function saveSecurityComplianceData() {
        // Audit events
        const auditEvents = Array.from(document.querySelectorAll('.audit-event:checked')).map(cb => cb.value);
        
        // Compliance standards
        const complianceStandards = Array.from(document.querySelectorAll('.compliance-standard:checked')).map(cb => cb.value);
        
        setupConfig.auditRetentionDays = parseInt(document.getElementById('auditRetention').value);
        setupConfig.auditEventsToLog = auditEvents;
        setupConfig.alertOnSuspiciousActivity = document.getElementById('alertOnSuspicious').checked;
        setupConfig.complianceStandards = complianceStandards;
        setupConfig.dataResidency = document.getElementById('dataResidency').value;

        console.log('Security compliance saved:', {
            retention: setupConfig.auditRetentionDays,
            events: setupConfig.auditEventsToLog,
            standards: setupConfig.complianceStandards
        });
    }

    function saveRolesData() {
        const allRoles = ['administrator', 'product-owner', 'manager', 'analyst', 'user', 'engineer', 'quality'];
        const rolesActive = [];
        const rolesInactive = [];
        
        allRoles.forEach(role => {
            const checkbox = document.getElementById(`role-${role}`);
            if (checkbox && checkbox.checked) {
                rolesActive.push(role);
            } else {
                rolesInactive.push(role);
            }
        });
        
        setupConfig.rolesActive = rolesActive;
        setupConfig.rolesInactive = rolesInactive;

        console.log('Roles saved:', {
            active: rolesActive,
            inactive: rolesInactive
        });
    }

    // ============================================
    // REVIEW SECTION
    // ============================================

    function populateReview() {
        const reviewContent = document.getElementById('reviewContent');
        if (!reviewContent) return;

        let html = '';

        // Enterprise Apps Section
        html += '<div class="review-section">';
        html += '<h3 class="review-title"><i class="fa-solid fa-database"></i> Enterprise Apps</h3>';
        html += '<div class="review-items">';
        
        if (setupConfig.erpVendor) {
            html += `<div class="review-item">
                <span class="review-label">ERP System:</span>
                <span class="review-value">${setupConfig.erpVendor.toUpperCase()}</span>
            </div>`;
        }
        
        if (setupConfig.crmVendor) {
            html += `<div class="review-item">
                <span class="review-label">CRM System:</span>
                <span class="review-value">${setupConfig.crmVendor.toUpperCase()}</span>
            </div>`;
        }
        
        if (!setupConfig.erpVendor && !setupConfig.crmVendor) {
            html += '<div class="review-item"><span class="review-value text-muted">No enterprise apps configured</span></div>';
        }
        
        html += '</div></div>';

        // Network & Integration Section
        html += '<div class="review-section">';
        html += '<h3 class="review-title"><i class="fa-solid fa-network-wired"></i> Network & Integration</h3>';
        html += '<div class="review-items">';
        
        if (setupConfig.netbiosDomain) {
            html += `<div class="review-item">
                <span class="review-label">NetBIOS Domain:</span>
                <span class="review-value">${setupConfig.netbiosDomain}</span>
            </div>`;
        }
        
        html += `<div class="review-item">
            <span class="review-label">Deployment:</span>
            <span class="review-value">${setupConfig.deploymentType}</span>
        </div>`;
        
        if (setupConfig.smtpServer) {
            html += `<div class="review-item">
                <span class="review-label">SMTP Server:</span>
                <span class="review-value">${setupConfig.smtpServer}:${setupConfig.smtpPort || 587}</span>
            </div>`;
        }
        
        html += '</div></div>';

        // Security & Compliance Section
        html += '<div class="review-section">';
        html += '<h3 class="review-title"><i class="fa-solid fa-shield-halved"></i> Security & Compliance</h3>';
        html += '<div class="review-items">';
        
        html += `<div class="review-item">
            <span class="review-label">Audit Retention:</span>
            <span class="review-value">${setupConfig.auditRetentionDays} days</span>
        </div>`;
        
        if (setupConfig.auditEventsToLog && setupConfig.auditEventsToLog.length > 0) {
            html += `<div class="review-item">
                <span class="review-label">Events Logged:</span>
                <span class="review-value">${setupConfig.auditEventsToLog.length} event types</span>
            </div>`;
        }
        
        if (setupConfig.complianceStandards && setupConfig.complianceStandards.length > 0) {
            html += `<div class="review-item">
                <span class="review-label">Compliance Standards:</span>
                <span class="review-value">${setupConfig.complianceStandards.map(s => s.toUpperCase()).join(', ')}</span>
            </div>`;
        }
        
        html += '</div></div>';

        // Roles Section
        html += '<div class="review-section">';
        html += '<h3 class="review-title"><i class="fa-solid fa-users-gear"></i> User Roles</h3>';
        html += '<div class="review-items">';
        
        if (setupConfig.rolesActive && setupConfig.rolesActive.length > 0) {
            html += `<div class="review-item">
                <span class="review-label">Active Roles:</span>
                <span class="review-value">${setupConfig.rolesActive.map(r => r.charAt(0).toUpperCase() + r.slice(1).replace('-', ' ')).join(', ')}</span>
            </div>`;
        }
        
        html += '</div></div>';

        reviewContent.innerHTML = html;
    }

    // ============================================
    // COMPLETE SETUP - SEND TO BACKEND
    // ============================================

    async function completeSetup() {
        console.log('Completing setup with data:', setupConfig);

        try {
            // Show loading state
            completeBtn.disabled = true;
            completeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

            // Send to backend
            const response = await fetch(`${API_BASE_URL}/api/rbac/save_setup_simple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(setupConfig)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to save setup');
            }

            const result = await response.json();
            console.log('Setup saved successfully:', result);

            // Store organization ID in localStorage for future use
            localStorage.setItem('organizationId', result.organization_id);
            localStorage.setItem('companyName', setupConfig.companyName);

            // Show success message
            alert(`✓ Setup completed successfully!\n\nOrganization ID: ${result.organization_id}\n\nYou will now be redirected to the login page.`);

            // Redirect to login page
            window.location.href = 'setup-login.html';

        } catch (error) {
            console.error('Error completing setup:', error);
            alert(`❌ Error: ${error.message}\n\nPlease try again or contact support.`);
            
            // Reset button
            completeBtn.disabled = false;
            completeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Complete Setup';
        }
    }

    // ============================================
    // DROPDOWN MENU (from existing page)
    // ============================================

    function initializeDropdown() {
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        const dropdownMenu = document.querySelector('.dropdown-menu');

        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.dropdown')) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }
    }
});
