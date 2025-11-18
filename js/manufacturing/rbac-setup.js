// RBAC Setup Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown menu logic (from existing page)
    initializeDropdown();

    // Get company name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company') || 'Your Organization';
    document.getElementById('companyNameDisplay').textContent = companyName;

    // Store company name in configuration
    const setupConfig = {
        companyName: companyName,
        enterpriseSystems: {},
        networkIntegration: {},
        securityCompliance: {},
        roles: {
            active: ['administrator', 'product-owner', 'manager', 'analyst', 'user'],
            inactive: []
        }
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

    function navigateStep(direction) {
        // Validate current step before proceeding
        if (direction > 0 && !validateCurrentStep()) {
            return;
        }

        // Save current step data
        saveStepData(currentStep);

        // Move to next/previous step
        currentStep += direction;

        // Update display
        updateStepDisplay();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.setup-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        document.getElementById(`step${currentStep}`).classList.add('active');

        // Update progress bar
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        document.getElementById('progressFill').style.width = `${progressPercentage}%`;

        // Update progress steps
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

        // Update header text based on step
        updateHeaderText();

        // If on review step, populate review section
        if (currentStep === 5) {
            populateReview();
        }
    }

    function updateHeaderText() {
        const titles = {
            1: `Welcome, ${companyName}!`,
            2: 'Network & Integration',
            3: 'Security & Compliance',
            4: 'Role-Based Access Control',
            5: 'Ready to Launch!'
        };

        const subtitles = {
            1: "Let's configure your manufacturing intelligence platform",
            2: 'Configure system integration and notifications',
            3: 'Set up security protocols and compliance requirements',
            4: 'Define user roles and permissions',
            5: 'Review your configuration and complete setup'
        };

        document.getElementById('setupTitle').innerHTML = titles[currentStep].replace(companyName, `<span>${companyName}</span>`);
        document.getElementById('setupSubtitle').textContent = subtitles[currentStep];
    }

    function validateCurrentStep() {
        switch (currentStep) {
            case 1:
                // Check if at least one system is selected
                const systems = ['erpSystem', 'crmSystem', 'scmSystem', 'mesSystem', 'plmSystem'];
                const hasSelection = systems.some(id => document.getElementById(id).value !== '');
                
                if (!hasSelection) {
                    alert('Please select at least one enterprise system to continue.');
                    return false;
                }
                return true;

            case 2:
                // Validate SMTP configuration if email notifications are important
                const smtpServer = document.getElementById('smtpServer').value.trim();
                const senderEmail = document.getElementById('senderEmail').value.trim();
                
                if (smtpServer && !senderEmail) {
                    alert('Please provide a sender email address for SMTP configuration.');
                    return false;
                }
                
                if (senderEmail && !isValidEmail(senderEmail)) {
                    alert('Please provide a valid sender email address.');
                    return false;
                }
                return true;

            case 3:
                // Security step - always valid but we'll save the data
                return true;

            case 4:
                // Role step - always valid (5 roles are active by default)
                return true;

            default:
                return true;
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function saveStepData(step) {
        switch (step) {
            case 1:
                saveEnterpriseSystemsData();
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

    function saveEnterpriseSystemsData() {
        const systems = ['erp', 'crm', 'scm', 'mes', 'plm'];
        
        systems.forEach(system => {
            const select = document.getElementById(`${system}System`);
            const checkbox = document.querySelector(`.heavy-checkbox[data-system="${system}"]`);
            
            if (select && select.value) {
                setupConfig.enterpriseSystems[system] = {
                    vendor: select.value,
                    heavyUsage: checkbox ? checkbox.checked : false
                };
            }
        });
    }

    function saveNetworkIntegrationData() {
        setupConfig.networkIntegration = {
            netbiosDomain: document.getElementById('netbiosDomain').value.trim(),
            deploymentType: document.getElementById('deploymentType').value,
            smtp: {
                server: document.getElementById('smtpServer').value.trim(),
                port: document.getElementById('smtpPort').value,
                encryption: document.getElementById('smtpEncryption').value,
                senderEmail: document.getElementById('senderEmail').value.trim(),
                requiresAuth: document.getElementById('smtpAuth').checked
            },
            productVersion: 'Xforia COAST v2.1.0',
            updatePreference: document.getElementById('updatePreference').value,
            betaFeatures: document.getElementById('betaFeatures').checked
        };
    }

    function saveSecurityComplianceData() {
        const auditEvents = Array.from(document.querySelectorAll('.audit-event:checked')).map(cb => cb.value);
        const complianceStandards = Array.from(document.querySelectorAll('.compliance-standard:checked')).map(cb => cb.value);

        setupConfig.securityCompliance = {
            auditTrail: {
                retentionPeriod: document.getElementById('auditRetention').value,
                eventsToLog: auditEvents,
                alertOnSuspicious: document.getElementById('alertOnSuspicious').checked
            },
            compliance: {
                standards: complianceStandards,
                dataResidency: document.getElementById('dataResidency').value
            }
        };
    }

    function saveRolesData() {
        const activeRoles = [];
        const inactiveRoles = [];

        document.querySelectorAll('.role-card').forEach(card => {
            const roleName = card.getAttribute('data-role');
            const checkbox = card.querySelector('.role-checkbox');
            
            if (checkbox && checkbox.checked) {
                activeRoles.push(roleName);
            } else {
                inactiveRoles.push(roleName);
            }
        });

        setupConfig.roles = {
            active: activeRoles,
            inactive: inactiveRoles
        };
    }

    function populateReview() {
        // Review Enterprise Systems
        const systemsHTML = Object.entries(setupConfig.enterpriseSystems)
            .map(([system, data]) => {
                const systemNames = {
                    erp: 'ERP System',
                    crm: 'CRM System',
                    scm: 'SCM System',
                    mes: 'MES System',
                    plm: 'PLM System'
                };
                const heavyBadge = data.heavyUsage ? '<span class="review-badge">Heavy Usage</span>' : '';
                return `
                    <div class="review-item">
                        <span class="review-item-label">${systemNames[system]}</span>
                        <span class="review-item-value">${heavyBadge}${capitalizeVendor(data.vendor)}</span>
                    </div>
                `;
            })
            .join('');
        document.getElementById('reviewSystems').innerHTML = systemsHTML || '<p style="color: #888;">No systems configured</p>';

        // Review Network & Integration
        const networkHTML = `
            <div class="review-item">
                <span class="review-item-label">Deployment Type</span>
                <span class="review-item-value">${capitalizeFirst(setupConfig.networkIntegration.deploymentType)}</span>
            </div>
            ${setupConfig.networkIntegration.netbiosDomain ? `
            <div class="review-item">
                <span class="review-item-label">NetBIOS Domain</span>
                <span class="review-item-value">${setupConfig.networkIntegration.netbiosDomain}</span>
            </div>
            ` : ''}
            ${setupConfig.networkIntegration.smtp.server ? `
            <div class="review-item">
                <span class="review-item-label">SMTP Server</span>
                <span class="review-item-value">${setupConfig.networkIntegration.smtp.server}:${setupConfig.networkIntegration.smtp.port}</span>
            </div>
            ` : ''}
            <div class="review-item">
                <span class="review-item-label">Update Preference</span>
                <span class="review-item-value">${capitalizeFirst(setupConfig.networkIntegration.updatePreference)} Updates</span>
            </div>
        `;
        document.getElementById('reviewNetwork').innerHTML = networkHTML;

        // Review Security & Compliance
        const securityHTML = `
            <div class="review-item">
                <span class="review-item-label">Audit Retention</span>
                <span class="review-item-value">${setupConfig.securityCompliance.auditTrail.retentionPeriod} Days</span>
            </div>
            <div class="review-item">
                <span class="review-item-label">Events Logged</span>
                <span class="review-item-value">${setupConfig.securityCompliance.auditTrail.eventsToLog.length} Event Types</span>
            </div>
            ${setupConfig.securityCompliance.compliance.standards.length > 0 ? `
            <div class="review-item">
                <span class="review-item-label">Compliance Standards</span>
                <span class="review-item-value">${setupConfig.securityCompliance.compliance.standards.map(s => s.toUpperCase()).join(', ')}</span>
            </div>
            ` : ''}
        `;
        document.getElementById('reviewSecurity').innerHTML = securityHTML;

        // Review Roles
        const rolesHTML = setupConfig.roles.active
            .map(role => {
                const roleNames = {
                    'administrator': 'Administrator',
                    'product-owner': 'Product Owner',
                    'manager': 'Manager',
                    'analyst': 'Analyst',
                    'user': 'User',
                    'engineer': 'Engineer',
                    'quality': 'Quality Manager'
                };
                return `<span class="review-badge">${roleNames[role]}</span>`;
            })
            .join('');
        document.getElementById('reviewRoles').innerHTML = rolesHTML;
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function capitalizeVendor(vendor) {
        const vendorNames = {
            'sap': 'SAP',
            'oracle': 'Oracle',
            'microsoft': 'Microsoft',
            'infor': 'Infor',
            'epicor': 'Epicor',
            'salesforce': 'Salesforce',
            'hubspot': 'HubSpot',
            'blueyonder': 'Blue Yonder',
            'kinaxis': 'Kinaxis',
            'siemens': 'Siemens',
            'rockwell': 'Rockwell',
            'ge': 'GE Digital',
            'dassault': 'Dassault Systèmes',
            'apriso': 'DELMIA Apriso',
            'ptc': 'PTC',
            'arena': 'Arena',
            'other': 'Other'
        };
        return vendorNames[vendor] || capitalizeFirst(vendor);
    }

    function completeSetup() {
        // Save final step data
        saveStepData(currentStep);

        // Store configuration in localStorage
        localStorage.setItem('xforiaSetupConfig', JSON.stringify(setupConfig));

        // Show loading state
        completeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Completing Setup...';
        completeBtn.disabled = true;

        // Simulate setup completion (in real app, this would send to backend)
        setTimeout(() => {
            // Redirect to login page (update this path as needed)
            window.location.href = 'setup-login.html';
        }, 1500);
    }

    // Role toggle functionality
    document.querySelectorAll('.role-checkbox').forEach(checkbox => {
        // Skip disabled checkboxes (the 5 core roles)
        if (checkbox.disabled) return;

        checkbox.addEventListener('change', function() {
            const roleCard = this.closest('.role-card');
            const roleBadge = roleCard.querySelector('.role-badge');

            if (this.checked) {
                roleCard.classList.add('active');
                roleBadge.textContent = 'Active';
                roleBadge.classList.add('active-badge');
            } else {
                roleCard.classList.remove('active');
                roleBadge.textContent = 'Inactive';
                roleBadge.classList.remove('active-badge');
            }
        });
    });

    // SMTP encryption auto-update port
    document.getElementById('smtpEncryption').addEventListener('change', function() {
        const portInput = document.getElementById('smtpPort');
        if (this.value === 'tls') {
            portInput.value = '587';
        } else if (this.value === 'ssl') {
            portInput.value = '465';
        } else {
            portInput.value = '25';
        }
    });

    // Initialize dropdown menu (from existing page)
    function initializeDropdown() {
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
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            if (currentStep < totalSteps) {
                nextBtn.click();
            } else {
                completeBtn.click();
            }
        }
    });

    // Add tooltips functionality
    document.querySelectorAll('.info-tooltip').forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const title = this.getAttribute('title');
            if (title) {
                this.setAttribute('data-original-title', title);
                this.removeAttribute('title');
            }
        });
    });

    console.log('RBAC Setup initialized for:', companyName);
});
