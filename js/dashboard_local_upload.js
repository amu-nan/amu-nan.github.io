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
            try {
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

                    // Save data to localStorage
                    localStorage.setItem('patientData', JSON.stringify(formattedData));
                    
                    // The redirect happens ONLY after the file is processed and saved.
                    alert('File processed! Redirecting to dashboard...');
                    window.location.href = 'dashboard.html';
                    
                } else {
                    alert('The Excel file is empty or formatted incorrectly.');
                }
            } catch (error) {
                console.error("Error processing file:", error);
                alert("An error occurred while processing the file. Please ensure it's a valid Excel file.");
            }
        };
        reader.readAsArrayBuffer(file);
    });
});
