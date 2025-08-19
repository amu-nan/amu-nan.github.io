document.addEventListener('DOMContentLoaded', () => {
    const ownerDisplay = document.getElementById('owner-display');
    const orgDisplay = document.getElementById('org-display');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const uploadSubmitBtn = document.getElementById('upload-submit-btn');
    const actionButtonsContainer = document.querySelector('.action-buttons-container');

    // Retrieve names from local storage and display them
    const ownerName = localStorage.getItem('ownerName');
    const orgName = localStorage.getItem('orgName');
    
    if (ownerName && orgName) {
        ownerDisplay.textContent = ownerName;
        orgDisplay.textContent = orgName;
    } else {
        // Redirect back to owner page if names aren't set
        window.location.href = 'owner.html';
    }

    // Handle file upload
    fileInput.addEventListener('change', (event) => {
        fileList.innerHTML = '';
        const files = event.target.files;
        
        if (files.length > 0) {
            uploadSubmitBtn.disabled = false;
            for (const file of files) {
                const listItem = document.createElement('li');
                listItem.textContent = file.name;
                fileList.appendChild(listItem);
            }
        } else {
            uploadSubmitBtn.disabled = true;
        }
    });

    // Handle upload submission
    uploadSubmitBtn.addEventListener('click', () => {
        const files = fileInput.files;

        // Prepare payload for backend (simulated)
        const payload = new FormData();
        payload.append('organizationName', orgName);
        payload.append('ownerName', ownerName);
        
        for (const file of files) {
            payload.append('file', file);
        }

        // You would typically use fetch() here to send the payload to your backend.
        // For now, let's just log the payload details
        console.log('Simulating backend payload:', {
            organizationName: orgName,
            ownerName: ownerName,
            files: Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }))
        });

        alert('File uploaded successfully! Check the console for the payload.');

        // Show the action buttons after successful upload
        actionButtonsContainer.style.display = 'block';
        uploadSubmitBtn.style.display = 'none'; // Hide the upload button
    });
});
