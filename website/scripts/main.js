// JSONPlaceholder API endpoint
const dataApiUrl = "http://98.70.76.114/api/raw";
const predApiUrl = "http://98.70.76.114/api/prediction";

// Fetch data and update dashboard
async function fetchData() {
    try {
        const response = await fetch(dataApiUrl);
        const data = await response.json();
        console.log("RAW DATA: ", data)

        // Update DOM with fetched data
        document.getElementById("soil-moisture").textContent = `Soil Moisture: ${data.soil_moisture}m`;
        document.getElementById("rain").textContent = `Rain: ${data.rain}mm`;
        document.getElementById("temperature").textContent = `Temp: ${data.temperature}°C`;
        document.getElementById("humidity").textContent = `Humidity: ${data.relative_humidity}%`;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function fetchPrediction(){
    try {
        const response = await fetch(predApiUrl);
        const data = await response.json();
        const prediction_level_map = new Map([
            [0, "Low Risk (Below 50%)"],
            [1, "Medium Risk (75% - 90%)"],
            [2, "High Risk (Above 90%))"]
        ])
        console.log("PREDICTION: ", data);
        pred_24 = data.prediction_24;
        pred_48 = data.prediction_48;
        console.log("LASDL", pred_24)
        document.getElementById("24hr-forecast").textContent = `Forecast: ${prediction_level_map.get(pred_24)}`;
        document.getElementById("48hr-forecast").textContent = `Forecast: ${prediction_level_map.get(pred_48)}`;
        chartData.datasets.data = [data.level_24, data.level_48];
    } catch (error) {
        console.error("Error fetching data:", error)
    }
}

// UPDATE!
const chartData = {
    labels: ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9', 'day10'],
    datasets: [{
        label: 'Flood Forecast',
        data: [50, 19, 23, 34, 10, 34, 12, 56, 23, 40],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1,
    }]
};

const chartConfig = {
    type: 'line',
    data: chartData,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
};

const ctx = document.getElementById('forecast-chart').getContext('2d');

// Fetch data on page load
fetchData();
fetchPrediction();
new Chart(ctx, chartConfig);
