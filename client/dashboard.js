document.addEventListener("DOMContentLoaded", fetchLogs);

function fetchLogs() {
    fetch("http://localhost:3000/api/attack/sql/logs")
        .then(res => res.json())
        .then(data => {
            const tableBody = document.getElementById("logsBody");
            tableBody.innerHTML = ""; // Clear existing rows

            // The API returns { safeQueriesProcessed: true, totalAttacks: N, attacks: [...] }
            // Let's check for both structures in case we fetch from a regular log endpoint
            const logsArray = data.attacks ? data.attacks : (Array.isArray(data) ? data : []);

            if (logsArray.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='6' class='no-data-msg'>No attacks detected yet.</td></tr>";
                return;
            }

            logsArray.forEach(log => {
                const tr = document.createElement("tr");

                const timeStr = new Date(log.timestamp).toLocaleString();
                
                // Styling classes based on severity
                let severityClass = "severity-low";
                if (log.severity === "High" || log.severity === "Critical") {
                    severityClass = "severity-high";
                } else if (log.severity === "Medium") {
                    severityClass = "severity-medium";
                }

                // Confidence format
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
            });
        })
        .catch(err => {
            console.error("Failed to fetch logs:", err);
            const tableBody = document.getElementById("logsBody");
            tableBody.innerHTML = "<tr><td colspan='6' class='error-msg'>Failed to load logs. Is the server running?</td></tr>";
        });
}
