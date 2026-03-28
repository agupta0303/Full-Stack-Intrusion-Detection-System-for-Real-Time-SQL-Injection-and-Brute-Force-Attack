document.addEventListener("DOMContentLoaded", fetchLogs);

let attackChartInstance = null;

function fetchLogs() {
    fetch("http://localhost:3000/api/attack/sql/logs")
        .then(res => res.json())
        .then(data => {
            const tableBody = document.getElementById("logsBody");
            tableBody.innerHTML = ""; // Clear existing rows
            const logsArray = data.attacks ? data.attacks : (Array.isArray(data) ? data : []);

            if (logsArray.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='6' class='no-data-msg'>No attacks detected yet.</td></tr>";
                if (attackChartInstance) {
                    attackChartInstance.destroy();
                }
                return;
            }

            let sqlCount = 0;
            let bruteCount = 0;
            let otherCount = 0;

            logsArray.forEach(log => {
                const tr = document.createElement("tr");

                const timeStr = new Date(log.timestamp).toLocaleString();
                
                let severityClass = "severity-low";
                if (log.severity === "High" || log.severity === "Critical") {
                    severityClass = "severity-high";
                } else if (log.severity === "Medium") {
                    severityClass = "severity-medium";
                }

                let confidence = log.confidenceScore * 100;
                if (confidence > 100) confidence = 100;

                tr.innerHTML = `
                    <td>${timeStr}</td>
                    <td class="attack-type">${log.attackType}</td>
                    <td class="payload">${log.payload}</td>
                    <td>${confidence.toFixed(1)}%</td>
                    <td><span class="badge ${severityClass}">${log.severity}</span></td>
                    <td>${log.detectedBy}</td>
                `;

                tableBody.appendChild(tr);

                if (log.attackType.toLowerCase().includes("sql")) {
                    sqlCount++;
                } else if (log.attackType.toLowerCase().includes("brute force")) {
                    bruteCount++;
                } else {
                    otherCount++;
                }
            });

            renderChart(sqlCount, bruteCount, otherCount);
        })
        .catch(err => {
            console.error("Failed to fetch logs:", err);
            const tableBody = document.getElementById("logsBody");
            tableBody.innerHTML = "<tr><td colspan='6' class='error-msg'>Failed to load logs. Is the server running?</td></tr>";
        });
}

function renderChart(sqlCount, bruteCount, otherCount) {
    const ctx = document.getElementById("attackChart").getContext("2d");

    if (attackChartInstance) {
        attackChartInstance.destroy();
    }

    const labels = [];
    const data = [];
    const backgroundColors = [];

    if (sqlCount > 0) {
        labels.push("SQL Injection");
        data.push(sqlCount);
        backgroundColors.push("#ff4d4d");
    }
    if (bruteCount > 0) {
        labels.push("Brute Force");
        data.push(bruteCount);
        backgroundColors.push("#4da6ff");
    }
    if (otherCount > 0) {
        labels.push("Other Attacks");
        data.push(otherCount);
        backgroundColors.push("#ffcc00");
    }

    if (data.length === 0) return; 

    attackChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Attack Type Breakdown'
                }
            }
        }
    });
}
