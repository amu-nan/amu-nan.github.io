document.addEventListener('DOMContentLoaded', async () => {
    try {
        const dashboardTitle = document.getElementById('dashboard-title');
        const dashboardSubtitle = document.getElementById('dashboard-subtitle');
        const endDemoButton = document.querySelector('.end-demo-btn');

        // Check for the uploaded file and organization name
        const uploadedFileName = localStorage.getItem('uploadedFileName');
        const orgName = localStorage.getItem('orgName');

        if (!uploadedFileName) {
            dashboardTitle.textContent = "No Data Found";
            dashboardSubtitle.textContent = "Please upload a file on the previous page to view the dashboard.";
            return;
        }

        // Set the dashboard header dynamically
        if (orgName) {
            dashboardTitle.textContent = `${orgName} Dashboard`;
            dashboardSubtitle.textContent = `A quick overview of your patient data from ${orgName}.`;
        }

        // Fetch the chart data from the backend
        const backendBaseUrl = 'http://127.0.0.1:8000';
        // Use the correct backend endpoint that returns a JSON list of charts
        const response = await fetch(`${backendBaseUrl}/dashboard/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const chartsData = await response.json();

        // Find all the chart container divs
        const containers = document.querySelectorAll('.chart-container');

        // Render each chart dynamically
        containers.forEach((container, index) => {
            if (chartsData[index]) {
                const chartJson = JSON.parse(chartsData[index]);
                
                if (!chartJson.layout) {
                    chartJson.layout = {};
                }
                
                chartJson.layout.autosize = true;
                
                Plotly.newPlot(container, chartJson.data, chartJson.layout, { responsive: true });
            }
        });

        // --- Navigation Buttons ---
        if (endDemoButton) {
            endDemoButton.addEventListener('click', () => {
                localStorage.clear();
                window.location.href = '../index.html';
            });
        }
    } catch (error) {
        console.error("Failed to load dashboard charts:", error);
    }
});
