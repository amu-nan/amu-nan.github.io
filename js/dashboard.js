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

    // --- NEW: Improved findColumn function ---
    function findColumn(data, type, usedColumns = []) {
        if (!data || data.length === 0) return null;
        const headers = Object.keys(data[0]);

        const rankedHeaders = headers.map(header => {
            const firstValue = data.find(row => row[header] !== undefined && row[header] !== null)?.[header];
            if (firstValue === undefined || usedColumns.includes(header)) return null;

            const uniqueValues = new Set(data.map(row => row[header]));
            const uniqueCount = uniqueValues.size;
            const totalRows = data.length;

            let score = 0;
            if (type === 'categorical') {
                if (typeof firstValue === 'string' && isNaN(parseInt(firstValue))) {
                    if (uniqueCount > 1 && uniqueCount <= 20) {
                        score = 100 - uniqueCount;
                    }
                }
            } else if (type === 'numerical') {
                if (!isNaN(parseFloat(firstValue)) && uniqueCount > 5) {
                    if (header.toLowerCase().includes('id') || uniqueCount === totalRows) {
                        score = 0;
                    } else {
                        score = uniqueCount;
                    }
                }
            }
            return { header, score };
        }).filter(h => h && h.score > 0);

        rankedHeaders.sort((a, b) => b.score - a.score);
        return rankedHeaders.length > 0 ? rankedHeaders[0].header : null;
    }

    const usedColumns = [];

    // --- CHART 1: Pie Chart (Categorical Distribution) ---
    const pieColumn = findColumn(patientData, 'categorical', usedColumns);
    if (pieColumn) {
        usedColumns.push(pieColumn);
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
        Plotly.newPlot('chart1', pieData, {
            title: `Distribution of ${pieColumn}`,
            margin: { t: 40, b: 0, l: 0, r: 0 }
        });
    } else {
        document.getElementById('chart1').textContent = "No suitable categorical data for a Pie Chart.";
    }

    // --- CHART 2: Bar Chart (Categorical Distribution) ---
    const barColumn = findColumn(patientData, 'categorical', usedColumns);
    if (barColumn) {
        usedColumns.push(barColumn);
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
        Plotly.newPlot('chart2', barData, {
            title: `Count of ${barColumn}`,
            xaxis: { title: barColumn },
            yaxis: { title: 'Count' },
            margin: { t: 40, b: 40, l: 40, r: 0 }
        });
    } else {
        document.getElementById('chart2').textContent = "No suitable categorical data for a Bar Chart.";
    }

    // --- CHART 3: Histogram (Numerical Distribution) ---
    const histColumn = findColumn(patientData, 'numerical', usedColumns);
    if (histColumn) {
        usedColumns.push(histColumn);
        const values = patientData.map(d => parseFloat(d[histColumn])).filter(v => !isNaN(v));
        
        const histData = [{
            x: values,
            type: 'histogram',
            hovertemplate: `Range: %{x}<br>Count: %{y}<extra></extra>`
        }];
        Plotly.newPlot('chart3', histData, {
            title: `Distribution of ${histColumn}`,
            xaxis: { title: histColumn },
            yaxis: { title: 'Count' },
            margin: { t: 40, b: 40, l: 40, r: 0 }
        });
    } else {
        document.getElementById('chart3').textContent = "No suitable numerical data for a Histogram.";
    }

    // --- CHART 4: Scatter Plot (Numerical Correlation) ---
    const scatterX = findColumn(patientData, 'numerical', usedColumns);
    if (scatterX) usedColumns.push(scatterX);
    const scatterY = findColumn(patientData, 'numerical', usedColumns);
    
    if (scatterX && scatterY) {
        usedColumns.push(scatterY);
        
        const scatterData = [{
            x: patientData.map(d => parseFloat(d[scatterX])),
            y: patientData.map(d => parseFloat(d[scatterY])),
            mode: 'markers',
            type: 'scatter',
            marker: { size: 8 },
            hovertemplate: `<b>${scatterX}</b>: %{x}<br><b>${scatterY}</b>: %{y}<extra></extra>`
        }];
        Plotly.newPlot('chart4', scatterData, {
            title: `Scatter Plot of ${scatterX} vs ${scatterY}`,
            xaxis: { title: scatterX },
            yaxis: { title: scatterY },
            margin: { t: 40, b: 40, l: 40, r: 0 }
        });
    } else {
        document.getElementById('chart4').textContent = "At least two suitable numerical columns are required for a Scatter Plot.";
    }

    // --- CHART 5: Box Plot (Numerical Summary) ---
    const boxColumn = findColumn(patientData, 'numerical', usedColumns);
    if (boxColumn) {
        usedColumns.push(boxColumn);
        const values = patientData.map(d => parseFloat(d[boxColumn])).filter(v => !isNaN(v));

        const boxData = [{
            y: values,
            type: 'box',
            name: boxColumn,
            boxpoints: 'all'
        }];
        Plotly.newPlot('chart5', boxData, {
            title: `Summary of ${boxColumn}`,
            yaxis: { title: boxColumn },
            margin: { t: 40, b: 40, l: 40, r: 0 }
        });
    } else {
        document.getElementById('chart5').textContent = "No suitable numerical data for a Box Plot.";
    }

    // --- CHART 6: Horizontal Bar Chart (Top/Bottom values) ---
    const barXColumn = findColumn(patientData, 'numerical', usedColumns);
    const barYColumn = findColumn(patientData, 'categorical', usedColumns);

    if (barXColumn && barYColumn) {
        usedColumns.push(barXColumn, barYColumn);
        
        const aggregatedData = patientData.reduce((acc, row) => {
            const category = row[barYColumn];
            const value = parseFloat(row[barXColumn]);
            if (category && !isNaN(value)) {
                if (!acc[category]) {
                    acc[category] = { sum: 0, count: 0 };
                }
                acc[category].sum += value;
                acc[category].count += 1;
            }
            return acc;
        }, {});

        const averagedData = Object.keys(aggregatedData).map(category => ({
            category,
            average: aggregatedData[category].sum / aggregatedData[category].count
        })).sort((a, b) => b.average - a.average);

        const topCategories = averagedData.slice(0, 10);
        
        const hBarData = [{
            x: topCategories.map(d => d.average),
            y: topCategories.map(d => d.category),
            type: 'bar',
            orientation: 'h',
            hovertemplate: `Category: %{y}<br>Average: %{x:.2f}<extra></extra>`
        }];

        Plotly.newPlot('chart6', hBarData, {
            title: `Average ${barXColumn} by ${barYColumn} (Top 10)`,
            xaxis: { title: `Average ${barXColumn}` },
            yaxis: { title: barYColumn },
            margin: { t: 40, b: 40, l: 150, r: 0 }
        });
    } else {
        document.getElementById('chart6').textContent = "A suitable numerical and categorical column are required for this chart.";
    }

    // --- Navigation Buttons ---
    if (endDemoButton) {
        endDemoButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
});
