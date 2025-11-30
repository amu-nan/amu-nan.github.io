// RBAC Setup - Direct Supabase Version (No Backend Needed)
// This version talks directly to Supabase from the browser

// ============================================
// SUPABASE CONFIGURATION
// ============================================

// Your Supabase credentials
const SUPABASE_URL = 'https://aqasfpkazrebatjhdhig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxYXNmcGthenJlYmF0amhkaGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTMxMDYsImV4cCI6MjA3ODUyOTEwNn0.F18jn7ug3VD1g05NMxxa9Dp9YnSZycge4ekyb94GyYc';

// Supabase client will be initialized after library loads
let supabase = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase connected');
    } else {
        console.error('❌ Supabase library not loaded. Make sure you have the script tag in your HTML.');
        alert('Error: Supabase library not loaded. Please refresh the page.');
        return;
    }

    // Initialize dropdown menu
    initializeDropdown();

    // Get company name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company') || 'Your Organization';
    document.getElementById('companyNameDisplay').textContent = companyName;

    // Store configuration
    const setupConfig = {
        companyName: companyName
    };

    // Multi-step form management
    let currentStep = 1;
    const totalSteps = 5;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeBtn');

    // Navigation
    nextBtn.addEventListener('click', () => navigateStep(1));
    prevBtn.addEventListener('click', () => navigateStep(-1));
    completeBtn.addEventListener('click', completeSetup);

    updateStepDisplay();

    // ============================================
    // NAVIGATION FUNCTIONS
    // ============================================

    function navigateStep(direction) {
        if (direction > 0 && !validateCurrentStep()) {
            return;
        }

        saveCurrentStepData();
        currentStep += direction;
        
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

        // Update progress indicators
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

        // Update buttons
        prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
        completeBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';

        // Populate review if on last step
        if (currentStep === 5) {
            populateReview();
        }
    }

    function validateCurrentStep() {
        switch (currentStep) {
            case 1:
                const systems = ['erpSystem', 'crmSystem'];
                const hasSelection = systems.some(id => {
                    const element = document.getElementById(id);
                    return element && element.value !== '';
                });
                
                if (!hasSelection) {
                    alert('Please select at least one enterprise app (ERP or CRM) to continue.');
                    return false;
                }
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
    // DATA COLLECTION
    // ============================================

    function saveEnterpriseAppsData() {
        const erpSelect = document.getElementById('erpSystem');
        const crmSelect = document.getElementById('crmSystem');
        
        setupConfig.erpVendor = erpSelect && erpSelect.value ? erpSelect.value : null;
        setupConfig.crmVendor = crmSelect && crmSelect.value ? crmSelect.value : null;

        console.log('✓ Enterprise apps saved');
    }

    function saveNetworkIntegrationData() {
        setupConfig.netbiosDomain = document.getElementById('netbiosDomain')?.value.trim() || null;
        setupConfig.deploymentType = document.getElementById('deploymentType')?.value || 'cloud';
        setupConfig.smtpServer = document.getElementById('smtpServer')?.value.trim() || null;
        setupConfig.smtpPort = document.getElementById('smtpPort')?.value ? parseInt(document.getElementById('smtpPort').value) : null;
        setupConfig.smtpEncryption = document.getElementById('smtpEncryption')?.value || null;
        setupConfig.smtpSenderEmail = document.getElementById('senderEmail')?.value.trim() || null;
        setupConfig.smtpRequiresAuth = document.getElementById('smtpAuth')?.checked || false;
        setupConfig.productVersion = 'Xforia COAST v2.1.0';
        setupConfig.updatePreference = document.getElementById('updatePreference')?.value || 'automatic';
        setupConfig.betaFeaturesEnabled = document.getElementById('betaFeatures')?.checked || false;

        console.log('✓ Network integration saved');
    }

    function saveSecurityComplianceData() {
        const auditEvents = Array.from(document.querySelectorAll('.audit-event:checked')).map(cb => cb.value);
        const complianceStandards = Array.from(document.querySelectorAll('.compliance-standard:checked')).map(cb => cb.value);
        
        setupConfig.auditRetentionDays = parseInt(document.getElementById('auditRetention')?.value || 90);
        setupConfig.auditEventsToLog = auditEvents;
        setupConfig.alertOnSuspiciousActivity = document.getElementById('alertOnSuspicious')?.checked || false;
        setupConfig.complianceStandards = complianceStandards;
        setupConfig.dataResidency = document.getElementById('dataResidency')?.value || 'none';

        console.log('✓ Security compliance saved');
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

        console.log('✓ Roles saved');
    }

    // ============================================
    // REVIEW SECTION
    // ============================================

    function populateReview() {
        const reviewContent = document.getElementById('reviewContent');
        if (!reviewContent) return;

        let html = '';

        // Enterprise Apps
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

        // Network & Integration
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

        // Security
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

        // Roles
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
    // SAVE TO SUPABASE (Direct - No Backend)
    // ============================================

    async function completeSetup() {
        console.log('📤 Saving to Supabase...', setupConfig);

        try {
            // Show loading
            completeBtn.disabled = true;
            completeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

            // Prepare data for database (convert camelCase to snake_case)
            const dbData = {
                company_name: setupConfig.companyName,
                erp_vendor: setupConfig.erpVendor,
                crm_vendor: setupConfig.crmVendor,
                netbios_domain: setupConfig.netbiosDomain,
                deployment_type: setupConfig.deploymentType,
                smtp_server: setupConfig.smtpServer,
                smtp_port: setupConfig.smtpPort,
                smtp_encryption: setupConfig.smtpEncryption,
                smtp_sender_email: setupConfig.smtpSenderEmail,
                smtp_requires_auth: setupConfig.smtpRequiresAuth,
                product_version: setupConfig.productVersion,
                update_preference: setupConfig.updatePreference,
                beta_features_enabled: setupConfig.betaFeaturesEnabled,
                audit_retention_days: setupConfig.auditRetentionDays,
                audit_events_to_log: setupConfig.auditEventsToLog,
                alert_on_suspicious_activity: setupConfig.alertOnSuspiciousActivity,
                compliance_standards: setupConfig.complianceStandards,
                data_residency: setupConfig.dataResidency,
                roles_active: setupConfig.rolesActive,
                roles_inactive: setupConfig.rolesInactive,
                setup_completed: true,
                setup_completed_at: new Date().toISOString()
            };

            console.log('📊 Data prepared for database:', dbData);

            // Insert into Supabase
            const { data, error } = await supabase
                .from('organization_setup')
                .insert([dbData])
                .select();

            if (error) {
                console.error('❌ Supabase error:', error);
                throw new Error(error.message);
            }

            console.log('✅ Saved to database:', data);

            // Get the inserted organization ID
            const organizationId = data[0].id;

            // Store in localStorage
            localStorage.setItem('organizationId', organizationId);
            localStorage.setItem('companyName', setupConfig.companyName);

            // Success!
            alert(`✅ Setup completed successfully!

Organization ID: ${organizationId}
Company: ${setupConfig.companyName}

Your data has been saved to the database.

You will now be redirected to the login page.`);

            // Redirect
            window.location.href = 'setup-login.html';

        } catch (error) {
            console.error('❌ Error:', error);
            
            alert(`❌ Error saving setup:

${error.message}

Please try again or contact support.`);
            
            // Reset button
            completeBtn.disabled = false;
            completeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Complete Setup';
        }
    }

    // ============================================
    // DROPDOWN MENU
    // ============================================

    function initializeDropdown() {
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        const dropdownMenu = document.querySelector('.dropdown-menu');

        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            document.addEventListener('click', function(e) {
                if (!e.target.closest('.dropdown')) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }
    }
});
