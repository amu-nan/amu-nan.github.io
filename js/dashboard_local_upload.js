// This file handles file processing and dashboard redirection.
document.addEventListener('DOMContentLoaded', () => {
    const ownerDisplay = document.getElementById('owner-display');
    const orgDisplay = document.getElementById('org-display');
    const fileInput = document.getElementById('file-input');
    const processBtn = document.getElementById('process-for-dashboard-btn');
    const fileList = document.getElementById('file-list');

    const ownerName = localStorage.getItem('ownerName');
    const orgName = localStorage.getItem('orgName');
    
    if (ownerName && orgName) {
        ownerDisplay.textContent = ownerName;
        orgDisplay.textContent = orgName;
    } else {
        window.location.href = 'owner.html';
    }

    fileInput.addEventListener('change', (event) => {
        fileList.innerHTML = '';
        const files = event.target.files;
        
        if (files.length > 0) {
            processBtn.disabled = false;
            const listItem = document.createElement('li');
            listItem.textContent = files[0].name;
            fileList.appendChild(listItem);
        } else {
            processBtn.disabled = true;
        }
    });

    processBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            console.log("File loaded. Attempting to parse...");
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                console.log("Workbook read:", workbook); // Check if this logs
                
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                console.log("Worksheet found:", worksheet); // Check if this logs
                
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                console.log("JSON parsed:", json); // Check if this logs
                
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
                    
                    console.log("Formatted data:", formattedData); // Check if this logs

                    // Save data to localStorage
                    localStorage.setItem('patientData', JSON.stringify(formattedData));
                    console.log("Data saved to localStorage. Redirecting..."); // Check if this logs
                    
                    // The redirect happens ONLY after the file is processed and saved.
                    alert('File processed! Redirecting to dashboard...');
                    window.location.href = 'dashboard.html';
                    
                } else {
                    console.error('File is empty or formatted incorrectly.');
                    alert('The Excel file is empty or formatted incorrectly.');
                }
            } catch (error) {
                console.error("An error occurred during file processing:", error);
                alert("An error occurred while processing the file. Please ensure it's a valid Excel file.");
            }
        };
        reader.readAsArrayBuffer(file);
    });
});
