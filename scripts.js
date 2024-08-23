// Function to fetch and load quotes from quotes.json
async function fetchQuotes() {
    try {
        const response = await fetch('quotes.json'); // Adjust the path as per your file location
        if (!response.ok) {
            throw new Error('Failed to fetch quotes');
        }
        const data = await response.json();
        return data.map(item => item.quote); // Extract quotes from JSON objects
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return []; // Return empty array in case of error
    }
}

// Define an array to hold quotes
let quotes = [];

// Function to type out the quote
function typewriterEffect(element, text, index = 0) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        setTimeout(() => typewriterEffect(element, text, index + 1), 50); // Adjust speed as needed
    }
}

// Function to adjust font size based on quote length
function adjustFontSize(quote) {
    const baseFontSize = 1.5; // Base font size in em
    const maxLength = 50; // Length threshold for font size adjustment
    
    // Adjust the font size based on the quote length
    let fontSize = baseFontSize;
    
    if (quote.length > maxLength) {
        fontSize -= (quote.length - maxLength) * 0.01;
    }
    
    // Ensure the font size doesn't go below a certain size for readability
    if (fontSize < 1.0) {
        fontSize = 1.0; // Minimum readable font size
    }
    
    return fontSize + 'em';
}

// Function to type out the quote
function typewriterEffect(element, text, index = 0) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        setTimeout(() => typewriterEffect(element, text, index + 1), 50); // Adjust speed as needed
    }
}

// Function to display a random quote with animation
async function displayRandomQuote() {
    if (quotes.length === 0) {
        // Fetch quotes if not already loaded
        quotes = await fetchQuotes();
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteElement = document.getElementById('dailyQuote');
    if (quoteElement) {
        quoteElement.textContent = ''; // Clear the previous text
        let quote = quotes[randomIndex];
        quoteElement.style.fontSize = adjustFontSize(quote); // Adjust the font size
        typewriterEffect(quoteElement, quote); // Apply the typewriter effect to the new quote
    }
}

// Call the function to display a quote on page load
displayRandomQuote();

// Optionally, update the quote daily using setInterval
setInterval(displayRandomQuote, 24 * 60 * 60 * 1000); // Update every 24 hours


const bpForm = document.getElementById('bpForm');
const readingsTableBody = document.getElementById('readingsTableBody');
const systolicValueSpan = document.getElementById('systolicValue');
const diastolicValueSpan = document.getElementById('diastolicValue');
const interpretationTextElement = document.getElementById('interpretationText');
const interpretationIconElement = document.getElementById('interpretationIcon');

bpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const systolic = parseInt(document.getElementById('systolic').value);
    const diastolic = parseInt(document.getElementById('diastolic').value);

    const interpretation = interpretBloodPressure(systolic, diastolic); // Calculate interpretation

    // Update BP Results section
    systolicValueSpan.textContent = systolic;
    diastolicValueSpan.textContent = diastolic;
    interpretationTextElement.textContent = interpretation;
    updateInterpretationIcon(interpretation);

    // Log the reading with interpretation
    const entry = { date, systolic, diastolic, interpretation };
    let entries = JSON.parse(localStorage.getItem('bpReadings')) || [];
    entries.push(entry);
    localStorage.setItem('bpReadings', JSON.stringify(entries));

    // Update and display readings table
    displayReadings();
});

function displayReadings() {
    const entries = JSON.parse(localStorage.getItem('bpReadings')) || [];
    readingsTableBody.innerHTML = '';
    entries.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.systolic}</td>
            <td>${entry.diastolic}</td>
            <td>${entry.interpretation}</td>
            <td><button onclick="deleteReading(${index})">Delete</button></td>
        `;
        readingsTableBody.appendChild(row);
    });
}

// Function to delete a reading
function deleteReading(index) {
    let entries = JSON.parse(localStorage.getItem('bpReadings')) || [];
    entries.splice(index, 1);
    localStorage.setItem('bpReadings', JSON.stringify(entries));
    displayReadings();
}

// Function to interpret Blood Pressure
function interpretBloodPressure(systolic, diastolic) {
    if (systolic <= 90 || diastolic <= 60) {
        return "Low Blood Pressure";
    } else if (systolic <= 120 && diastolic <= 80) {
        return "Normal";
    } else if (systolic >= 120 && systolic < 130 && diastolic < 80) {
        return "Elevated";
    } else if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
        return "Elevated Blood Pressure";
    } else if (systolic >= 140 || diastolic >= 90) {
        return "Higher Blood Pressure Level";
    } else {
        return "Unknown";
    }
}

// Function to update interpretation icon
function updateInterpretationIcon(interpretation) {
    if (interpretation === "Normal") {
        interpretationIconElement.className = "interpretation-icon fas fa-smile";
    } else if (interpretation === "Elevated") {
        interpretationIconElement.className = "interpretation-icon fas fa-meh";
    } else if (interpretation.includes("Hypertension")) {
        interpretationIconElement.className = "interpretation-icon fas fa-frown";
    } else if (interpretation === "Low Blood Pressure") {
        interpretationIconElement.className = "interpretation-icon fas fa-tired";
    } else {
        interpretationIconElement.className = "interpretation-icon fas fa-question";
    }
}

// Initial display of readings on page load
displayReadings();


function switchMethod(method) {
    document.getElementById('manual-monitoring').classList.remove('active');
    document.getElementById('automatic-monitoring').classList.remove('active');
    document.getElementById('manual').classList.remove('active');
    document.getElementById('automatic').classList.remove('active');

    if (method === 'manual') {
        document.getElementById('manual-monitoring').classList.add('active');
        document.getElementById('manual').classList.add('active');
    } else if (method === 'automatic') {
        document.getElementById('automatic-monitoring').classList.add('active');
        document.getElementById('automatic').classList.add('active');
    }
}

const bpChartCtx = document.getElementById('bpChart').getContext('2d');
    let bpChart;

    // Function to get user data from localStorage
    function getUserData(period) {
        const entries = JSON.parse(localStorage.getItem('bpReadings')) || [];
        const labels = [];
        const systolicData = [];
        const diastolicData = [];
        
        let filteredEntries;

        if (period === 'weekly') {
            filteredEntries = filterEntriesByWeek(entries);
        } else if (period === 'monthly') {
            filteredEntries = filterEntriesByMonth(entries);
        }

        filteredEntries.forEach(entry => {
            labels.push(entry.date);
            systolicData.push(entry.systolic);
            diastolicData.push(entry.diastolic);
        });

        return { labels, systolicData, diastolicData };
    }

    // Function to filter entries by week
    function filterEntriesByWeek(entries) {
        // Implement filtering logic here
        // Example: Return entries from the last 7 days
        return entries.slice(-7); // Adjust based on actual filtering logic
    }

    // Function to filter entries by month
    function filterEntriesByMonth(entries) {
        // Implement filtering logic here
        // Example: Return entries from the current month
        return entries.slice(-30); // Adjust based on actual filtering logic
    }

    // Function to draw/update the chart
    function drawChart(period) {
        const data = getUserData(period);

        if (bpChart) {
            bpChart.destroy(); // Destroy previous chart instance
        }

        bpChart = new Chart(bpChartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Systolic Pressure',
                        data: data.systolicData,
                        borderColor: 'red',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 1,
                        fill: true
                    },
                    {
                        label: 'Diastolic Pressure',
                        data: data.diastolicData,
                        borderColor: 'blue',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 1,
                        fill: true
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.dataset.label + ': ' + tooltipItem.raw + ' mmHg';
                            }
                        }
                    }
                }
            }
        });
    }

    // Initial chart draw
    drawChart('weekly'); // Default to weekly view