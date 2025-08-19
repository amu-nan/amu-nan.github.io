document.addEventListener('DOMContentLoaded', () => {
    const patientSelect = document.getElementById('patient-select');
    const uploadBtn = document.querySelector('.upload-btn');
    const chatbotBtn = document.querySelector('.chatbot-btn');
    const uploadPanel = document.getElementById('upload-panel');
    const chatbotPanel = document.getElementById('chatbot-panel');
    const continueBtn = document.querySelector('.continue-button');

    // Enable/disable buttons based on patient selection
    patientSelect.addEventListener('change', () => {
        if (patientSelect.value) {
            uploadBtn.disabled = false;
            chatbotBtn.disabled = false;
        } else {
            uploadBtn.disabled = true;
            chatbotBtn.disabled = true;
        }
    });

    // Handle Upload button click
    uploadBtn.addEventListener('click', () => {
        uploadPanel.style.display = 'block';
        chatbotPanel.style.display = 'none';
        continueBtn.style.display = 'block';
    });

    // Handle Chatbot button click
    chatbotBtn.addEventListener('click', () => {
        uploadPanel.style.display = 'none';
        chatbotPanel.style.display = 'block';
        continueBtn.style.display = 'block';
    });
});

// Upload functionality
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const uploadSubmitBtn = document.getElementById('upload-submit-btn');

let uploadedFiles = [];

fileInput.addEventListener('change', (event) => {
    // Clear previous list and files
    fileList.innerHTML = '';
    uploadedFiles = [];
    
    // Add new files
    for (const file of event.target.files) {
        uploadedFiles.push(file);
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        fileList.appendChild(listItem);
    }

    if (uploadedFiles.length > 0) {
        uploadSubmitBtn.disabled = false;
    } else {
        uploadSubmitBtn.disabled = true;
    }
});

uploadSubmitBtn.addEventListener('click', () => {
    const patientName = document.getElementById('patient-select').value;
    const filesToUpload = uploadedFiles;

    if (!patientName) {
        alert('Please select a patient before submitting.');
        return;
    }

    if (filesToUpload.length === 0) {
        alert('Please select files to upload.');
        return;
    }

    // Prepare payload (simulated)
    const payload = new FormData();
    payload.append('patientName', patientName);
    filesToUpload.forEach((file) => {
        payload.append('file', file);
    });

    // You would typically use fetch() here to send the payload to your backend.
    // Example:
    // fetch('your-backend-api/upload', {
    //     method: 'POST',
    //     body: payload
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Success:', data);
    //     alert('Files uploaded successfully!');
    //     // You might redirect or show a success message here
    // })
    // .catch((error) => {
    //     console.error('Error:', error);
    //     alert('Upload failed.');
    // });

    // For now, let's just log the payload details
    console.log('Simulating backend payload:', {
        patientName: patientName,
        files: filesToUpload.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    alert('Files submitted. Check the console for the payload.');

    // Reset the form after submission
    fileList.innerHTML = '';
    uploadedFiles = [];
    uploadSubmitBtn.disabled = true;
});
