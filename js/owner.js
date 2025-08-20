document.addEventListener('DOMContentLoaded', () => {
    const orgTypeSelect = document.getElementById('organization-type');
    const orgInput = document.getElementById('organization-name');
    const ownerInput = document.getElementById('owner-name');
    const submitBtn = document.getElementById('submit-btn');

    submitBtn.addEventListener('click', () => {
        const orgType = orgTypeSelect.value;
        const orgName = orgInput.value.trim();
        const ownerName = ownerInput.value.trim();

        if (orgType && orgName && ownerName) {
            // Save names to local storage
            localStorage.setItem('orgType', orgType);
            localStorage.setItem('orgName', orgName);
            localStorage.setItem('ownerName', ownerName);
            
            // Redirect to the dashboard_upload page
            window.location.href = 'dashboard_upload.html';
        } else {
            alert('Please fill out all fields to continue.');
        }
    });
});
