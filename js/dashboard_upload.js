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
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        // Create a FormData object to send the file and other data to the backend
        const formData = new FormData();
        formData.append('data_file', file);
        formData.append('organization_name', orgName);
        formData.append('owner_name', ownerName);

        // Replace this URL with your actual backend file upload endpoint
        const uploadUrl = 'YOUR_BACKEND_FILE_UPLOAD_ENDPOINT';

        fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('File uploaded successfully!', data);
            alert('File uploaded successfully! You can now navigate to the Chatbot or Dashboard.');
            
            // Show the action buttons after a successful upload
            actionButtonsContainer.style.display = 'block';
            uploadSubmitBtn.style.display = 'none';
        })
        .catch(error => {
            console.error('There was an error uploading the file:', error);
            alert('File upload failed. Please check the console for details.');
        });
    });
});
