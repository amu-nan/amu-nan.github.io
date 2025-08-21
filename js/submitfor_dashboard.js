// submitfor_dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // We assume the user is on the dashboard_upload.html page and has selected a file
    const submitForDashboardBtn = document.getElementById('submit-for-dashboard-btn');
    const fileInput = document.getElementById('file-input');

    if (submitForDashboardBtn) {
        submitForDashboardBtn.addEventListener('click', () => {
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a file to use for the dashboard.');
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

                        // Save the processed data to local storage for the dashboard
                        localStorage.setItem('patientData', JSON.stringify(formattedData));
                        
                        alert('File has been processed locally for the dashboard!');
                        
                        // Show the dashboard button
                        const actionButtonsContainer = document.querySelector('.action-buttons-container');
                        actionButtonsContainer.style.display = 'block';
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
    }
});
