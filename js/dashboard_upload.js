document.addEventListener('DOMContentLoaded', () => {
    const ownerDisplay = document.getElementById('owner-display');
    const orgDisplay = document.getElementById('org-display');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const uploadSubmitBtn = document.getElementById('upload-submit-btn');
    const actionButtonsContainer = document.querySelector('.action-buttons-container');
    const generateReportBtn = document.querySelector('.generate-report-btn');
    const goToChatbotBtn = document.querySelector('.chatbot-btn');

    // Retrieve names from local storage
    const ownerName = localStorage.getItem('ownerName');
    const orgName = localStorage.getItem('orgName');
    
    if (ownerName && orgName) {
        ownerDisplay.textContent = ownerName;
        orgDisplay.textContent = orgName;
    } else {
        window.location.href = 'owner.html';
    }

    // Handle file selection
    fileInput.addEventListener('change', (event) => {
        fileList.innerHTML = '';
        const files = event.target.files;
        
        if (files.length > 0) {
            uploadSubmitBtn.disabled = false;
            const listItem = document.createElement('li');
            listItem.textContent = files[0].name;
            fileList.appendChild(listItem);
        } else {
            uploadSubmitBtn.disabled = true;
        }
    });

    // Handle file submission to the backend
    uploadSubmitBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('data_file', file);
        formData.append('organization_name', orgName);
        formData.append('owner_name', ownerName);

        // This is your backend endpoint that will handle the file upload
        // and return the processed JSON data.
        const backendUploadUrl = 'YOUR_BACKEND_FILE_UPLOAD_ENDPOINT';

        fetch(backendUploadUrl, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Server error');
                });
            }
            return response.json();
        })
        .then(data => {
            // The backend sends back the processed data, which we save locally.
            localStorage.setItem('patientData', JSON.stringify(data.processed_data));
            
            alert('File has been uploaded and processed! You can now generate the dashboard report.');
            
            actionButtonsContainer.style.display = 'block';
            uploadSubmitBtn.style.display = 'none';
        })
        .catch(error => {
            console.error('There was an error uploading the file:', error);
            alert(`File upload failed: ${error.message}. Please check the console.`);
        });
    });

    // Handle navigation to the dashboard
    const handleNavigation = (event) => {
        if (!localStorage.getItem('patientData')) {
            alert('Please upload a file and wait for processing before proceeding.');
            event.preventDefault();
        }
    };

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', handleNavigation);
    }
    
    if (goToChatbotBtn) {
        goToChatbotBtn.addEventListener('click', handleNavigation);
    }
});

/* document.addEventListener('DOMContentLoaded', () => {
    const ownerDisplay = document.getElementById('owner-display');
    const orgDisplay = document.getElementById('org-display');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const uploadSubmitBtn = document.getElementById('upload-submit-btn');
    const actionButtonsContainer = document.querySelector('.action-buttons-container');
    const generateReportBtn = document.querySelector('.generate-report-btn'); // New button variable

    // Retrieve names from local storage and display them
    const ownerName = localStorage.getItem('ownerName');
    const orgName = localStorage.getItem('orgName');
    
    if (ownerName && orgName) {
        ownerDisplay.textContent = ownerName;
        orgDisplay.textContent = orgName;
    } else {
        window.location.href = 'owner.html';
    }

    // Handle file upload and parsing
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

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (json.length > 1) {
                const headers = json[0];
                const rawData = json.slice(1);
                
                const formattedData = rawData.map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                });

                localStorage.setItem('patientData', JSON.stringify(formattedData));
                
                alert('File uploaded and data processed successfully! You can now generate the dashboard report.');
                
                // Show the action buttons and hide the upload button
                actionButtonsContainer.style.display = 'block';
                uploadSubmitBtn.style.display = 'none';
            } else {
                alert('The Excel file is empty or formatted incorrectly.');
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // Handle navigation to the dashboard
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            if (localStorage.getItem('patientData')) {
                window.location.href = 'dashboard.html';
            } else {
                alert('Please upload a file first.');
            }
        });
    }
}); */
