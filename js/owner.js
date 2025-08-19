document.addEventListener('DOMContentLoaded', () => {
    const orgInput = document.getElementById('organization-name');
    const ownerInput = document.getElementById('owner-name');
    const submitBtn = document.getElementById('submit-btn');

    submitBtn.addEventListener('click', () => {
        const orgName = orgInput.value.trim();
        const ownerName = ownerInput.value.trim();

        if (orgName && ownerName) {
            // Save names to local storage
            localStorage.setItem('orgName', orgName);
            localStorage.setItem('ownerName', ownerName);
            
            // Redirect to the dashboard_upload page
            window.location.href = 'dashboard_upload.html';
        } else {
            alert('Please fill out both fields to continue.');
        }
    });
});

