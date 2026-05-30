import React, { useState, useEffect } from 'react';
import { fetchWeather } from './api/fetchWeather';
import { usePreferences } from './PreferencesContext';

const App = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const { isCelsius, toggleTemperatureUnit } = usePreferences();
  const [localWeatherData, setLocalWeatherData] = useState(null);
  const [queuedCity, setQueuedCity] = useState(null);
  const [localWeatherError, setLocalWeatherError] = useState(null);

  const temp = (data) =>
    `${isCelsius ? data.current?.temp_c : data.current?.temp_f}°${isCelsius ? 'C' : 'F'}`;

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocalWeatherError('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await fetchWeather(`${coords.latitude},${coords.longitude}`);
          setLocalWeatherData(data);
        } catch (err) {
          setLocalWeatherError('Could not load local weather.');
        }
      },
      () => setLocalWeatherError('Location access denied. Allow location to see local weather.')
    );
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = async (event) => {
      if (event.data?.type === 'PROCESS_QUEUE') {
        const queue = JSON.parse(localStorage.getItem('pendingQueue') || '[]');
        if (queue.length > 0) {
          localStorage.removeItem('pendingQueue');
          setQueuedCity(null);
          await searchWeather(queue[0]);
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);

  const searchWeather = async (city) => {
    try {
      const data = await fetchWeather(city);
      setWeather(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setWeather(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Please enter a location');
      setWeather(null);
      return;
    }
    if (!navigator.onLine) {
      localStorage.setItem('pendingQueue', JSON.stringify([location.trim()]));
      setQueuedCity(location.trim());
      setLocation('');
      navigator.serviceWorker.ready.then((reg) => {
        if ('sync' in reg) reg.sync.register('weather-search');
      });
      return;
    }

    await searchWeather(location.trim());
    const searchedLocations = JSON.parse(localStorage.getItem('searchedLocations')) || [];
    if (!searchedLocations.includes(location.trim())) {
      searchedLocations.push(location.trim());
      localStorage.setItem('searchedLocations', JSON.stringify(searchedLocations));
    }
    localStorage.setItem('lastLocation', location.trim());
    setLocation('');
  };

  const searchedLocations = JSON.parse(localStorage.getItem('searchedLocations') || '[]');

  return (
    <div>
      <div>
        <h2>Local Weather</h2>
        {localWeatherError ? (
          <p>{localWeatherError}</p>
        ) : localWeatherData ? (
          <>
            <p>{localWeatherData.location?.name}</p>
            <p>{temp(localWeatherData)}</p>
            <p>{localWeatherData.current?.condition?.text}</p>
          </>
        ) : (
          <p>Loading local weather...</p>
        )}
      </div>

      <h1>Enter Location</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name"
        />
        <button type="submit">Search</button>
        <button type="button" onClick={toggleTemperatureUnit}>
          {isCelsius ? 'Show in °F' : 'Show in °C'}
        </button>
      </form>
      {queuedCity && <p>"{queuedCity}" is queued and will load when you're back online.</p>}
      {error && <p>{error}</p>}
      {weather && (
        <div>
          <h2>{weather.location?.name}</h2>
          <p>{temp(weather)}</p>
          <p>{weather.current?.condition?.text}</p>
        </div>
      )}

      {searchedLocations.length > 0 && (
        <div>
          <h2>Recent Searches</h2>
          <ul>
            {searchedLocations.slice(-5).reverse().map((loc, index) => (
              <li key={index} onClick={() => searchWeather(loc)} style={{ cursor: 'pointer' }}>{loc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
