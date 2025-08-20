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
            
            // Convert worksheet to JSON, skipping the header
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (json.length > 1) {
                // Get headers from the first row and data from the rest
                const headers = json[0];
                const rawData = json.slice(1);
                
                // Convert raw data to an array of objects for easier processing
                const formattedData = rawData.map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                });

                // Store the formatted data in localStorage
                localStorage.setItem('patientData', JSON.stringify(formattedData));
                
                alert('File uploaded and data processed successfully! You can now navigate to the Dashboard or Chatbot.');
                
                // Show the action buttons and hide the upload button
                actionButtonsContainer.style.display = 'block';
                uploadSubmitBtn.style.display = 'none';
            } else {
                alert('The Excel file is empty or formatted incorrectly.');
            }
        };
        reader.readAsArrayBuffer(file);
    });
});
