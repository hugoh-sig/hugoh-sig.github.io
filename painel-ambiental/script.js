// Global variables
let temperatureChart, ndviChart, precipitationChart;
let map;
let droneData = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeLastUpdate();
    initializeCharts();
    initializeMap();
    initializeDroneData();
    setupEventListeners();
    animateKPIs();
});

// Update last update time
function initializeLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = timeString;
}

// Initialize charts
function initializeCharts() {
    initializeTemperatureChart();
    initializeNDVIChart();
    initializePrecipitationChart();
}

// Temperature Chart
function initializeTemperatureChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    // Generate realistic temperature data
    const labels = [];
    const data = [];
    const droneTemps = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        
        // Simulate temperature variation
        const baseTemp = 24 + Math.sin(i * 0.2) * 3 + (Math.random() - 0.5) * 2;
        data.push(baseTemp.toFixed(1));
        
        // Drone temperature data (higher resolution)
        const droneTemp = baseTemp + (Math.random() - 0.5) * 1;
        droneTemps.push(droneTemp.toFixed(1));
    }
    
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperatura Satélite',
                    data: data,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Temperatura Drone',
                    data: droneTemps,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// NDVI Chart
function initializeNDVIChart() {
    const ctx = document.getElementById('ndviChart').getContext('2d');
    
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const satelliteData = [0.65, 0.68, 0.72, 0.75, 0.71, 0.68, 0.66, 0.69, 0.73, 0.76, 0.74, 0.70];
    const droneData = [0.67, 0.70, 0.74, 0.77, 0.73, 0.70, 0.68, 0.71, 0.75, 0.78, 0.76, 0.72];
    
    ndviChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'NDVI Satélite',
                    data: satelliteData,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: '#22c55e',
                    borderWidth: 1
                },
                {
                    label: 'NDVI Drone (Alta Resolução)',
                    data: droneData,
                    backgroundColor: 'rgba(6, 182, 212, 0.7)',
                    borderColor: '#06b6d4',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Índice NDVI'
                    }
                }
            }
        }
    });
}

// Precipitation Chart
function initializePrecipitationChart() {
    const ctx = document.getElementById('precipitationChart').getContext('2d');
    
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = [180, 145, 120, 85, 45, 25, 15, 30, 65, 110, 155, 190];
    
    precipitationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Precipitação (mm)',
                data: data,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Precipitação (mm)'
                    }
                }
            }
        }
    });
}

// Initialize Map
function initializeMap() {
    // Initialize Leaflet map
    map = L.map('map').setView([-19.9167, -43.9345], 10); // Belo Horizonte coordinates
    
    // Add base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add drone survey areas
    addDroneSurveyAreas();
    
    // Add weather stations
    addWeatherStations();
    
    // Add satellite coverage areas
    addSatelliteCoverage();
}

// Add drone survey areas to map
function addDroneSurveyAreas() {
    const droneAreas = [
        {
            name: "Área de Reflorestamento - Norte",
            coords: [[-19.85, -43.95], [-19.85, -43.90], [-19.80, -43.90], [-19.80, -43.95]],
            data: { area: "245 ha", resolution: "5 cm/pixel", date: "15/09/2025" }
        },
        {
            name: "Monitoramento Erosão - Sul",
            coords: [[-19.98, -43.88], [-19.98, -43.83], [-19.93, -43.83], [-19.93, -43.88]],
            data: { area: "180 ha", resolution: "3 cm/pixel", date: "22/09/2025" }
        },
        {
            name: "Área Urbana - Centro",
            coords: [[-19.92, -43.94], [-19.92, -43.89], [-19.87, -43.89], [-19.87, -43.94]],
            data: { area: "320 ha", resolution: "8 cm/pixel", date: "28/09/2025" }
        }
    ];
    
    droneAreas.forEach(area => {
        const polygon = L.polygon(area.coords, {
            color: '#06b6d4',
            fillColor: '#06b6d4',
            fillOpacity: 0.3,
            weight: 2
        }).addTo(map);
        
        polygon.bindPopup(`
            <div style="font-family: Inter, sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #1e293b;">${area.name}</h4>
                <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Área:</strong> ${area.data.area}</p>
                <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Resolução:</strong> ${area.data.resolution}</p>
                <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Último voo:</strong> ${area.data.date}</p>
            </div>
        `);
    });
}

// Add weather stations to map
function addWeatherStations() {
    const stations = [
        { name: "Estação Norte", coords: [-19.85, -43.92], status: "online" },
        { name: "Estação Sul", coords: [-19.95, -43.85], status: "online" },
        { name: "Estação Centro", coords: [-19.90, -43.91], status: "online" },
        { name: "Estação Oeste", coords: [-19.88, -43.98], status: "maintenance" }
    ];
    
    stations.forEach(station => {
        const color = station.status === 'online' ? '#22c55e' : '#f59e0b';
        
        L.circleMarker(station.coords, {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map).bindPopup(`
            <div style="font-family: Inter, sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #1e293b;">${station.name}</h4>
                <p style="margin: 4px 0; font-size: 0.9rem;">Status: <span style="color: ${color}; font-weight: 600;">${station.status === 'online' ? 'Online' : 'Manutenção'}</span></p>
            </div>
        `);
    });
}

// Add satellite coverage areas
function addSatelliteCoverage() {
    const coverage = L.rectangle([[-20.1, -44.1], [-19.7, -43.7]], {
        color: '#4f46e5',
        fillColor: '#4f46e5',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '10, 10'
    }).addTo(map);
    
    coverage.bindPopup(`
        <div style="font-family: Inter, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #1e293b;">Cobertura Satelital</h4>
            <p style="margin: 4px 0; font-size: 0.9rem;">Landsat 8/9 e Sentinel-2</p>
            <p style="margin: 4px 0; font-size: 0.9rem;">Resolução: 10-30m</p>
            <p style="margin: 4px 0; font-size: 0.9rem;">Frequência: 5-16 dias</p>
        </div>
    `);
}

// Initialize drone data
function initializeDroneData() {
    droneData = [
        {
            id: 1,
            name: "Levantamento Reflorestamento",
            area: 245,
            resolution: 5,
            date: "2025-09-15",
            ndvi: 0.78,
            coverage: "Completa"
        },
        {
            id: 2,
            name: "Monitoramento Erosão",
            area: 180,
            resolution: 3,
            date: "2025-09-22",
            ndvi: 0.45,
            coverage: "Parcial"
        },
        {
            id: 3,
            name: "Área Urbana",
            area: 320,
            resolution: 8,
            date: "2025-09-28",
            ndvi: 0.35,
            coverage: "Completa"
        }
    ];
}

// Setup event listeners
function setupEventListeners() {
    // Chart period buttons
    document.querySelectorAll('.chart-btn[data-period]').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from siblings
            this.parentNode.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart based on period
            const period = this.dataset.period;
            updateTemperatureChart(period);
        });
    });
    
    // Map layer selector
    document.getElementById('mapLayer').addEventListener('change', function() {
        updateMapLayer(this.value);
    });
    
    // NDVI region selector
    document.getElementById('ndviRegion').addEventListener('change', function() {
        updateNDVIChart(this.value);
    });
}

// Update temperature chart based on period
function updateTemperatureChart(period) {
    // Simulate different data for different periods
    const labels = [];
    const data = [];
    const droneTemps = [];
    
    const days = parseInt(period);
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        if (days <= 30) {
            labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        } else if (days <= 90) {
            if (i % 3 === 0) {
                labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            }
        } else {
            if (i % 10 === 0) {
                labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            }
        }
        
        const baseTemp = 24 + Math.sin(i * 0.1) * 4 + (Math.random() - 0.5) * 3;
        data.push(baseTemp.toFixed(1));
        
        const droneTemp = baseTemp + (Math.random() - 0.5) * 1.5;
        droneTemps.push(droneTemp.toFixed(1));
    }
    
    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = data;
    temperatureChart.data.datasets[1].data = droneTemps;
    temperatureChart.update('active');
}

// Update map layer
function updateMapLayer(layer) {
    // This would typically switch between different tile layers
    console.log(`Switching to ${layer} layer`);
    
    // Add visual feedback
    const mapContainer = document.querySelector('.map-container');
    mapContainer.style.opacity = '0.7';
    
    setTimeout(() => {
        mapContainer.style.opacity = '1';
        
        // Show notification
        showNotification(`Camada alterada para: ${getLayerName(layer)}`);
    }, 500);
}

// Get layer name in Portuguese
function getLayerName(layer) {
    const names = {
        'satellite': 'Imagem de Satélite',
        'ndvi': 'Índice de Vegetação (NDVI)',
        'temperature': 'Temperatura de Superfície',
        'drone': 'Levantamento com Drone'
    };
    return names[layer] || layer;
}

// Update NDVI chart based on region
function updateNDVIChart(region) {
    let satelliteData, droneData;
    
    switch(region) {
        case 'north':
            satelliteData = [0.70, 0.73, 0.77, 0.80, 0.76, 0.73, 0.71, 0.74, 0.78, 0.81, 0.79, 0.75];
            droneData = [0.72, 0.75, 0.79, 0.82, 0.78, 0.75, 0.73, 0.76, 0.80, 0.83, 0.81, 0.77];
            break;
        case 'south':
            satelliteData = [0.60, 0.63, 0.67, 0.70, 0.66, 0.63, 0.61, 0.64, 0.68, 0.71, 0.69, 0.65];
            droneData = [0.62, 0.65, 0.69, 0.72, 0.68, 0.65, 0.63, 0.66, 0.70, 0.73, 0.71, 0.67];
            break;
        case 'center':
            satelliteData = [0.55, 0.58, 0.62, 0.65, 0.61, 0.58, 0.56, 0.59, 0.63, 0.66, 0.64, 0.60];
            droneData = [0.57, 0.60, 0.64, 0.67, 0.63, 0.60, 0.58, 0.61, 0.65, 0.68, 0.66, 0.62];
            break;
        default:
            satelliteData = [0.65, 0.68, 0.72, 0.75, 0.71, 0.68, 0.66, 0.69, 0.73, 0.76, 0.74, 0.70];
            droneData = [0.67, 0.70, 0.74, 0.77, 0.73, 0.70, 0.68, 0.71, 0.75, 0.78, 0.76, 0.72];
    }
    
    ndviChart.data.datasets[0].data = satelliteData;
    ndviChart.data.datasets[1].data = droneData;
    ndviChart.update('active');
}

// Animate KPIs
function animateKPIs() {
    const kpiValues = document.querySelectorAll('.kpi-value .value');
    
    kpiValues.forEach(element => {
        const finalValue = parseFloat(element.textContent);
        const duration = 2000;
        const steps = 60;
        const stepValue = finalValue / steps;
        let currentValue = 0;
        let step = 0;
        
        const timer = setInterval(() => {
            currentValue += stepValue;
            step++;
            
            if (step >= steps) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            
            if (element.id === 'avgNDVI') {
                element.textContent = currentValue.toFixed(2);
            } else {
                element.textContent = Math.round(currentValue);
            }
        }, duration / steps);
    });
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(34, 197, 94, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 10000;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Simulate real-time updates
setInterval(() => {
    // Update KPI values slightly
    const tempElement = document.getElementById('avgTemp');
    const currentTemp = parseFloat(tempElement.textContent);
    const newTemp = currentTemp + (Math.random() - 0.5) * 0.2;
    tempElement.textContent = newTemp.toFixed(1);
    
    const ndviElement = document.getElementById('avgNDVI');
    const currentNDVI = parseFloat(ndviElement.textContent);
    const newNDVI = Math.max(0, Math.min(1, currentNDVI + (Math.random() - 0.5) * 0.01));
    ndviElement.textContent = newNDVI.toFixed(2);
    
    // Update last update time
    initializeLastUpdate();
}, 30000); // Update every 30 seconds
