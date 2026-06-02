// Weather API using Open-Meteo (free, no API key required)
const WEATHER_API = 'https://api.open-meteo.com/v1';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1';

const weatherContainer = document.getElementById('weatherContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const locationInput = document.getElementById('locationInput');

// Get weather icon based on weather code
function getWeatherIcon(code, isDay = true) {
    // WMO Weather interpretation codes
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code === 1 || code === 2) return isDay ? '🌤️' : '🌥️';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code === 51 || code === 53 || code === 55) return '🌦️';
    if (code === 61 || code === 63 || code === 65) return '🌧️';
    if (code === 71 || code === 73 || code === 75) return '❄️';
    if (code === 77) return '❄️';
    if (code === 80 || code === 81 || code === 82) return '🌧️';
    if (code === 85 || code === 86) return '❄️';
    if (code === 95 || code === 96 || code === 99) return '⛈️';
    return '🌤️';
}

// Get weather description based on code
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with hail'
    };
    return descriptions[code] || 'Unknown';
}

// Search for coordinates by city name
async function geocodeLocation(cityName) {
    try {
        const response = await fetch(
            `${GEOCODING_API}/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
        );
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('Location not found');
        }
        
        const result = data.results[0];
        return {
            name: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`,
            latitude: result.latitude,
            longitude: result.longitude
        };
    } catch (error) {
        throw new Error('Could not find location: ' + error.message);
    }
}

// Fetch weather data
async function fetchWeather(latitude, longitude, locationName) {
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(
            `${WEATHER_API}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        displayWeather(data, locationName, latitude, longitude);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Display weather data
function displayWeather(data, locationName, latitude, longitude) {
    const current = data.current;
    const daily = data.daily;
    
    // Update current weather
    document.getElementById('locationName').textContent = locationName;
    document.getElementById('coordinates').textContent = `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`;
    document.getElementById('temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('weatherDescription').textContent = getWeatherDescription(current.weather_code);
    document.getElementById('weatherIcon').textContent = getWeatherIcon(current.weather_code);
    document.getElementById('feelsLike').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('pressure').textContent = `${Math.round(current.pressure_msl)} mb`;
    document.getElementById('uvIndex').textContent = `${Math.round(current.uv_index)}`;
    document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    
    // Display 7-day forecast
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';
    
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div class="forecast-icon">${getWeatherIcon(daily.weather_code[i])}</div>
            <div class="forecast-description">${getWeatherDescription(daily.weather_code[i])}</div>
            <div class="forecast-temps">
                <span class="high">${Math.round(daily.temperature_2m_max[i])}°</span>
                <span class="low">${Math.round(daily.temperature_2m_min[i])}°</span>
            </div>
            <div class="forecast-precipitation">💧 ${Math.round(daily.precipitation_sum[i])}mm</div>
        `;
        forecastGrid.appendChild(forecastCard);
    }
    
    weatherContainer.style.display = 'block';
}

// Search weather by city name
async function searchWeather() {
    const cityName = locationInput.value.trim();
    if (!cityName) {
        showError('Please enter a city name');
        return;
    }
    
    try {
        const location = await geocodeLocation(cityName);
        fetchWeather(location.latitude, location.longitude, location.name);
    } catch (error) {
        showError(error.message);
    }
}

// Get weather for user's location
function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(latitude, longitude, `Your Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
        },
        (error) => {
            showLoading(false);
            showError('Could not get your location: ' + error.message);
        }
    );
}

// UI Helper functions
function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    errorMessage.textContent = '❌ ' + message;
    errorMessage.style.display = 'block';
    weatherContainer.style.display = 'none';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Allow Enter key to search
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Load default location (New York) on page load
window.addEventListener('load', () => {
    fetchWeather(40.7128, -74.0060, 'New York, United States');
});