document.addEventListener('DOMContentLoaded', () => {
    const endDemoButton = document.querySelector('.end-demo-btn');
    const dashboardTitle = document.getElementById('dashboard-title');
    const dashboardSubtitle = document.getElementById('dashboard-subtitle');

    const patientDataString = localStorage.getItem('patientData');
    if (!patientDataString) {
        dashboardTitle.textContent = "No Data Found";
        dashboardSubtitle.textContent = "Please upload a file on the previous page to view the dashboard.";
        return;
    }

    const patientData = JSON.parse(patientDataString);
    const orgName = localStorage.getItem('orgName');
    
    if (orgName) {
        dashboardTitle.textContent = `${orgName} Dashboard`;
        dashboardSubtitle.textContent = `A quick overview of your patient data from ${orgName}.`;
    }

    // A function to find a suitable column for a given chart type
    function findColumn(data, type) {
        if (!data || data.length === 0) return null;
        
        const headers = Object.keys(data[0]);
        for (const header of headers) {
            // Check the data type of the first non-empty cell in the column
            const firstValue = data.find(row => row[header] !== undefined && row[header] !== null)?.[header];
            
            if (firstValue === undefined) continue;

            if (type === 'categorical') {
                if (typeof firstValue === 'string' && isNaN(parseInt(firstValue))) {
                    return header;
                }
            } else if (type === 'numerical') {
                if (!isNaN(parseFloat(firstValue))) {
                    return header;
                }
            }
        }
        return null;
    }

    // --- CHART 1: Pie Chart (Categorical Data) ---
    const pieColumn = findColumn(patientData, 'categorical');
    if (pieColumn) {
        const counts = patientData.reduce((acc, row) => {
            const value = row[pieColumn];
            if (value) {
                acc[value] = (acc[value] || 0) + 1;
            }
            return acc;
        }, {});
        
        const pieData = [{
            values: Object.values(counts),
            labels: Object.keys(counts),
            type: 'pie',
            hovertemplate: `<b>${pieColumn}</b>: %{label}<br>Count: %{value}<br>Percentage: %{percent}<extra></extra>`
        }];
    
        const pieLayout = {
            title: `Distribution of ${pieColumn}`,
            height: 400,
            margin: { t: 40, b: 0, l: 0, r: 0 }
        };
        Plotly.newPlot('chart1', pieData, pieLayout);
    } else {
        document.getElementById('chart1').textContent = "No suitable categorical data for a Pie Chart.";
    }

    // --- CHART 2: Bar Chart (Categorical Data) ---
    const barColumn = findColumn(patientData, 'categorical');
    if (barColumn) {
        const counts = patientData.reduce((acc, row) => {
            const value = row[barColumn];
            if (value) {
                acc[value] = (acc[value] || 0) + 1;
            }
            return acc;
        }, {});
        
        const barData = [{
            x: Object.keys(counts),
            y: Object.values(counts),
            type: 'bar',
            hovertemplate: `<b>${barColumn}</b>: %{x}<br>Count: %{y}<extra></extra>`
        }];
    
        const barLayout = {
            title: `Count of ${barColumn}`,
            xaxis: { title: barColumn },
            yaxis: { title: 'Count' },
            height: 400,
            margin: { t: 40, b: 40, l: 40, r: 0 }
        };
        Plotly.newPlot('chart2', barData, barLayout);
    } else {
        document.getElementById('chart2').textContent = "No suitable categorical data for a Bar Chart.";
    }

    // --- CHART 3: Line Chart (Numerical Data) ---
    const lineColumn = findColumn(patientData, 'numerical');
    if (lineColumn) {
        const yValues = patientData.map(d => parseFloat(d[lineColumn])).filter(v => !isNaN(v)).sort((a, b) => a - b);
        const xValues = Array.from({length: yValues.length}, (_, i) => i + 1);

        const lineData = [{
            x: xValues,
            y: yValues,
            mode: 'lines',
            type: 'scatter',
            hovertemplate: `Patient Index: %{x}<br>Value: %{y}<extra></extra>`
        }];
        
        const lineLayout = {
            title: `Line Plot of ${lineColumn}`,
            xaxis: { title: 'Data Point Index' },
            yaxis: { title: lineColumn },
            height: 400,
            margin: { t: 40, b: 40, l: 40, r: 0 }
        };
        Plotly.newPlot('chart3', lineData, lineLayout);
    } else {
        document.getElementById('chart3').textContent = "No suitable numerical data for a Line Chart.";
    }

    // --- CHART 4: Scatter Plot (Numerical Data) ---
    const scatterColumns = [];
    Object.keys(patientData[0] || {}).forEach(header => {
        const firstValue = patientData.find(row => row[header] !== undefined && row[header] !== null)?.[header];
        if (firstValue !== undefined && !isNaN(parseFloat(firstValue))) {
            scatterColumns.push(header);
        }
    });

    if (scatterColumns.length >= 2) {
        const xColumn = scatterColumns[0];
        const yColumn = scatterColumns[1];
        
        const scatterData = [{
            x: patientData.map(d => d[xColumn]),
            y: patientData.map(d => d[yColumn]),
            mode: 'markers',
            type: 'scatter',
            marker: { size: 8 },
            hovertemplate: `<b>${xColumn}</b>: %{x}<br><b>${yColumn}</b>: %{y}<extra></extra>`
        }];

        const scatterLayout = {
            title: `Scatter Plot of ${xColumn} vs ${yColumn}`,
            xaxis: { title: xColumn },
            yaxis: { title: yColumn },
            height: 400,
            margin: { t: 40, b: 40, l: 40, r: 0 }
        };
        Plotly.newPlot('chart4', scatterData, scatterLayout);
    } else {
        document.getElementById('chart4').textContent = "At least two numerical columns are required for a Scatter Plot.";
    }

    // --- Navigation Buttons ---
    if (endDemoButton) {
        endDemoButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
});
