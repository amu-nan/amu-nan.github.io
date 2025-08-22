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

    chartContainer.on('plotly_click', function (data) {
        const point = data.points[0];
        const xValue = point.x;
        const yValue = point.y;
        
        console.log(`User clicked on: ${xValue} with value: ${yValue}`);
        updateChartWithDrilldown(xValue);
    });
};

const updateChartWithDrilldown = (category) => {
    console.log(`Triggering a dynamic update based on category: ${category}`);
    // Example: change the title of a chart to reflect the drilled-down view
    const drilldownContainer = document.getElementById('chart-container-3');
    if (drilldownContainer) {
        const newLayout = { ...drilldownContainer.layout, title: `Detailed View: ${category}` };
        const mockData = [{ x: ['A', 'B', 'C'], y: [10, 20, 30], type: 'bar' }];
        Plotly.react('chart-container-3', mockData, newLayout);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const dashboardTitle = document.getElementById('dashboard-title');
        const dashboardSubtitle = document.getElementById('dashboard-subtitle');
        const endDemoButton = document.querySelector('.end-demo-btn');

        const uploadedFileName = localStorage.getItem('uploadedFileName');
        const orgName = localStorage.getItem('orgName');

        if (!uploadedFileName) {
            dashboardTitle.textContent = "No Data Found";
            dashboardSubtitle.textContent = "Please upload a file on the previous page to view the dashboard.";
            return;
        }

        if (orgName) {
            dashboardTitle.textContent = `${orgName} Dashboard`;
            dashboardSubtitle.textContent = `A quick overview of your patient data from ${orgName}.`;
        }

        const backendUrl = 'http://127.0.0.1:8000/dashboard';
        const response = await fetch(backendUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const chartsData = data.charts;

        const containers = document.querySelectorAll('.chart-container');
        containers.forEach((container, index) => {
            if (chartsData[index]) {
                const chartJson = chartsData[index];
                renderChart(container.id, chartJson);
            }
        });

        if (endDemoButton) {
            endDemoButton.addEventListener('click', () => {
                localStorage.clear();
                window.location.href = '../index.html';
            });
        }
    } catch (error) {
        console.error("Failed to load dashboard charts:", error);
        const mainContent = document.querySelector('main');
        mainContent.innerHTML = `<p style="color: red; text-align: center; font-size: 1.2em;">Failed to load dashboard. Please ensure the backend server is running on ${backendUrl}.</p>`;
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
