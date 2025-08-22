// Function to render a chart in a container
const renderChart = (containerId, chartJson) => {
    const chartContainer = document.getElementById(containerId);
    if (!chartContainer) {
        console.error(`Container with ID ${containerId} not found.`);
        return;
    }

    const layout = chartJson.layout || {};
    layout.autosize = true;
    layout.margin = { t: 50, b: 50, l: 50, r: 50 };

    Plotly.react(containerId, chartJson.data, layout, {
        responsive: true,
        displayModeBar: false
    });

    // Optional click handler
    chartContainer.on('plotly_click', function (data) {
        const point = data.points[0];
        console.log(`User clicked on: ${point.x} with value: ${point.y}`);
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const dashboardTitle = document.getElementById('dashboard-title');
        const dashboardSubtitle = document.getElementById('dashboard-subtitle');
        const endDemoButton = document.querySelector('.end-demo-btn');

        // Optional: show org name from localStorage
        const orgName = localStorage.getItem('orgName');
        if (orgName) {
            dashboardTitle.textContent = `${orgName} Dashboard`;
            dashboardSubtitle.textContent = `A quick overview of your patient data from ${orgName}.`;
        }

        // Fetch charts from backend
        const backendUrl = 'http://127.0.0.1:8000/api/dashboard/';
        const response = await fetch(backendUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const chartsData = data.charts;

        const chartsContainer = document.getElementById("charts-container");
        chartsContainer.innerHTML = ""; // clear any previous charts

        // Dynamically create a container for each chart
        chartsData.forEach((chartJson, index) => {
            const div = document.createElement("div");
            div.id = `chart-container-${index}`;
            div.classList.add("chart-container");
            div.style.width = "600px";  // adjust as needed
            div.style.height = "400px"; // adjust as needed
            chartsContainer.appendChild(div);

            renderChart(div.id, chartJson);
        });

        // End demo button
        if (endDemoButton) {
            endDemoButton.addEventListener('click', () => {
                localStorage.clear();
                window.location.href = '../index.html';
            });
        }
    } catch (error) {
        console.error("Failed to load dashboard charts:", error);
        const mainContent = document.querySelector('main');
        mainContent.innerHTML = `<p style="color: red; text-align: center; font-size: 1.2em;">
            Failed to load dashboard. Ensure the backend is running on ${backendUrl}.
        </p>`;
    }
});


/*
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
