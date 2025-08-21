// This file handles both local and backend file processing.
document.addEventListener('DOMContentLoaded', () => {
    const ownerDisplay = document.getElementById('owner-display');
    const orgDisplay = document.getElementById('org-display');
    const fileInput = document.getElementById('file-input');
    const processBtn = document.getElementById('process-file-btn');
    const fileList = document.getElementById('file-list');
    const actionContainer = document.querySelector('.action-buttons-container');
    const chatbotBtn = document.getElementById('chatbot-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');

    const ownerName = localStorage.getItem('ownerName');
    const orgName = localStorage.getItem('orgName');
    
    if (ownerName && orgName) {
        ownerDisplay.textContent = ownerName;
        orgDisplay.textContent = orgName;
    } else {
        window.location.href = 'owner.html';
    }

    // Handles initial file selection
    fileInput.addEventListener('change', (event) => {
        fileList.innerHTML = '';
        const files = event.target.files;
        if (files.length > 0) {
            processBtn.disabled = false;
            const listItem = document.createElement('li');
            listItem.textContent = files[0].name;
            fileList.appendChild(listItem);
            actionContainer.style.display = 'none'; // Hide buttons if a new file is selected
        } else {
            processBtn.disabled = true;
        }
    });

    // Main button to validate file and show action buttons
    processBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file to process.');
            return;
        }
        alert('File is ready! Please choose an action.');
        actionContainer.style.display = 'block';
    });

    // Logic for "View Dashboard" button
    dashboardBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const headers = json[0];
                const rawData = json.slice(1);
                const formattedData = rawData.map(row => {
                    const obj = {};
                    headers.forEach((header, index) => obj[header] = row[index]);
                    return obj;
                });
                
                localStorage.setItem('patientData', JSON.stringify(formattedData));
                alert('Dashboard data processed! Redirecting...');
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Error processing file for local storage:", error);
                alert("An error occurred. Please ensure the file is a valid Excel file with headers and data.");
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // Logic for "Go to Chatbot" button
    chatbotBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('organization_name', orgName);
        formData.append('owner_name', ownerName);

        const uploadUrl = "http://127.0.0.1:8000/upload_excel/";

        fetch(uploadUrl, { method: 'POST', body: formData })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('File uploaded to backend successfully!', data);
            alert('File uploaded to backend! Redirecting to Chatbot...');
            window.location.href = 'demo_chatbot.html';
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            alert('File upload to backend failed. Check the console.');
        });
    });
});
