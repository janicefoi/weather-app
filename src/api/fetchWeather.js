const API_KEY = 'd99b9ba6f88745db92375817263005';
const BASE_URL = 'https://api.weatherapi.com/v1/current.json';

export const fetchWeather = async (location) => {
    const params = new URLSearchParams({
        key: API_KEY,
        q: location,
    });

    const response = await fetch(`${BASE_URL}?${params}`);
    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to fetch weather data');
    }

    return data;
};
