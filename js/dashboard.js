document.addEventListener('DOMContentLoaded', () => {
    const endDemoButton = document.querySelector('.end-demo-btn');
    const dashboardTitle = document.getElementById('dashboard-title');
    const dashboardSubtitle = document.getElementById('dashboard-subtitle');
    const reportFrame = document.getElementById('reportFrame'); 

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

    // This is the crucial part:
    // Construct the URL to your backend's dashboard endpoint.
    // Use your local backend URL for testing, e.g., 'http://127.0.0.1:8000'
    const backendBaseUrl = 'http://127.0.0.1:8000';
    const dashboardUrl = `${backendBaseUrl}/dashboard/?file_path=uploads/${uploadedFileName}`;

    // Set the iframe's source to the backend URL
    reportFrame.src = dashboardUrl;

    // --- Navigation Buttons ---
    if (endDemoButton) {
        endDemoButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
});
