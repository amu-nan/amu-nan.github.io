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

    // ============================================
    // RESTORE FROM CACHE (if exists)
    // ============================================
    
    function restoreFromCache() {
        const cached = localStorage.getItem('rbac_setup_config');
        if (cached) {
            try {
                const cachedConfig = JSON.parse(cached);
                // Merge cached data into setupConfig
                Object.assign(setupConfig, cachedConfig);
                console.log('✅ Restored from cache:', setupConfig);
                
                // Restore form fields after a brief delay to ensure DOM is ready
                setTimeout(restoreFormFields, 100);
                return true;
            } catch (e) {
                console.error('Error restoring cache:', e);
                return false;
            }
        }
        return false;
    }

    function restoreFormFields() {
        console.log('🔄 Restoring form fields...');
        
        // Step 1: Enterprise Apps
        if (setupConfig.erpVendor) {
            const erpSelect = document.getElementById('erpSystem');
            if (erpSelect) erpSelect.value = setupConfig.erpVendor;
        }
        if (setupConfig.crmVendor) {
            const crmSelect = document.getElementById('crmSystem');
            if (crmSelect) crmSelect.value = setupConfig.crmVendor;
        }

        // Step 2: Network & Integration
        if (setupConfig.netbiosDomain) {
            const netbios = document.getElementById('netbiosDomain');
            if (netbios) netbios.value = setupConfig.netbiosDomain;
        }
        if (setupConfig.deploymentType) {
            const deployment = document.getElementById('deploymentType');
            if (deployment) deployment.value = setupConfig.deploymentType;
        }
        if (setupConfig.smtpServer) {
            const smtp = document.getElementById('smtpServer');
            if (smtp) smtp.value = setupConfig.smtpServer;
        }
        if (setupConfig.smtpPort) {
            const port = document.getElementById('smtpPort');
            if (port) port.value = setupConfig.smtpPort;
        }
        if (setupConfig.smtpEncryption) {
            const encryption = document.getElementById('smtpEncryption');
            if (encryption) encryption.value = setupConfig.smtpEncryption;
        }
        if (setupConfig.smtpSenderEmail) {
            const sender = document.getElementById('senderEmail');
            if (sender) sender.value = setupConfig.smtpSenderEmail;
        }
        if (setupConfig.smtpRequiresAuth !== undefined) {
            const auth = document.getElementById('smtpAuth');
            if (auth) auth.checked = setupConfig.smtpRequiresAuth;
        }
        if (setupConfig.updatePreference) {
            const update = document.getElementById('updatePreference');
            if (update) update.value = setupConfig.updatePreference;
        }
        if (setupConfig.betaFeaturesEnabled !== undefined) {
            const beta = document.getElementById('betaFeatures');
            if (beta) beta.checked = setupConfig.betaFeaturesEnabled;
        }

        // Step 3: Security & Compliance
        if (setupConfig.auditRetentionDays) {
            const retention = document.getElementById('auditRetention');
            if (retention) retention.value = setupConfig.auditRetentionDays;
        }
        if (setupConfig.auditEventsToLog && setupConfig.auditEventsToLog.length > 0) {
            setupConfig.auditEventsToLog.forEach(event => {
                const checkbox = document.querySelector(`.audit-event[value="${event}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        if (setupConfig.alertOnSuspiciousActivity !== undefined) {
            const alert = document.getElementById('alertOnSuspicious');
            if (alert) alert.checked = setupConfig.alertOnSuspiciousActivity;
        }
        if (setupConfig.complianceStandards && setupConfig.complianceStandards.length > 0) {
            setupConfig.complianceStandards.forEach(standard => {
                const checkbox = document.querySelector(`.compliance-standard[value="${standard}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        if (setupConfig.dataResidency) {
            const residency = document.getElementById('dataResidency');
            if (residency) residency.value = setupConfig.dataResidency;
        }

        // Step 4: Roles
        if (setupConfig.rolesActive && setupConfig.rolesActive.length > 0) {
            setupConfig.rolesActive.forEach(role => {
                const checkbox = document.getElementById(`role-${role}`);
                if (checkbox) checkbox.checked = true;
            });
        }
        if (setupConfig.rolesInactive && setupConfig.rolesInactive.length > 0) {
            setupConfig.rolesInactive.forEach(role => {
                const checkbox = document.getElementById(`role-${role}`);
                if (checkbox) checkbox.checked = false;
            });
        }

        console.log('✅ All form fields restored from cache');
    }

    // Try to restore from cache on page load
    const hasCache = restoreFromCache();
    if (hasCache) {
        console.log('💾 Form data restored from previous session');
    }

    // ============================================
    // CLEAR CACHE FUNCTION (for manual reset)
    // ============================================
    
    window.clearRBACCache = function() {
        localStorage.removeItem('rbac_setup_config');
        console.log('🗑️ RBAC setup cache cleared');
        alert('Form data cleared. Page will reload.');
        window.location.reload();
    };
    
    // Make it available in console for debugging
    console.log('💡 To clear form cache, run: clearRBACCache()');

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

        console.log('✓ Enterprise apps saved:', setupConfig.erpVendor, setupConfig.crmVendor);
        
        // Also save to localStorage for persistence across page issues
        localStorage.setItem('rbac_setup_config', JSON.stringify(setupConfig));
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

        console.log('✓ Network integration saved:', setupConfig.deploymentType);
        localStorage.setItem('rbac_setup_config', JSON.stringify(setupConfig));
    }

    function saveSecurityComplianceData() {
        const auditEvents = Array.from(document.querySelectorAll('.audit-event:checked')).map(cb => cb.value);
        const complianceStandards = Array.from(document.querySelectorAll('.compliance-standard:checked')).map(cb => cb.value);
        
        setupConfig.auditRetentionDays = parseInt(document.getElementById('auditRetention')?.value || 90);
        setupConfig.auditEventsToLog = auditEvents;
        setupConfig.alertOnSuspiciousActivity = document.getElementById('alertOnSuspicious')?.checked || false;
        setupConfig.complianceStandards = complianceStandards;
        setupConfig.dataResidency = document.getElementById('dataResidency')?.value || 'none';

        console.log('✓ Security compliance saved:', auditEvents.length, 'events,', complianceStandards.length, 'standards');
        localStorage.setItem('rbac_setup_config', JSON.stringify(setupConfig));
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

        console.log('✓ Roles saved:', rolesActive.length, 'active,', rolesInactive.length, 'inactive');
        localStorage.setItem('rbac_setup_config', JSON.stringify(setupConfig));
    }

    // ============================================
    // REVIEW SECTION
    // ============================================

    function populateReview() {
        // Try multiple possible IDs for the review container
        let reviewContent = document.getElementById('reviewContent') 
                         || document.getElementById('review-content')
                         || document.getElementById('reviewSection')
                         || document.getElementById('review-section')
                         || document.querySelector('.review-content')
                         || document.querySelector('#step5 .step-content');
        
        // Debug logging
        console.log('📋 Populating review...');
        console.log('Review element found:', !!reviewContent);
        console.log('Current config:', setupConfig);
        
        if (!reviewContent) {
            console.error('❌ reviewContent element not found!');
            console.error('Available elements in step5:', document.querySelectorAll('#step5 *'));
            return;
        }
        
        console.log('✅ Using element:', reviewContent.id || reviewContent.className);

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
            <span class="review-value">${setupConfig.deploymentType || 'Cloud'}</span>
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
            <span class="review-value">${setupConfig.auditRetentionDays || 90} days</span>
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
        console.log('✅ Review populated successfully');
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

            // Clear the setup cache since we're done
            localStorage.removeItem('rbac_setup_config');
            console.log('🗑️ Setup cache cleared after successful submission');

            // Redirect directly (no alert)
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
