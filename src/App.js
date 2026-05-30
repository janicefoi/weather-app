import React from 'react';
import { fetchWeather } from './api/fetchWeather';

const App = () => {
  const [location, setLocation] = React.useState('');
  const [weather, setWeather] = React.useState(null);
  const [error, setError] = React.useState(null);
  
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

    await searchWeather(location.trim());
    //array to store searched locations in local storage
    const searchedLocations = JSON.parse(localStorage.getItem('searchedLocations')) || [];
    if (!searchedLocations.includes(location.trim())) {
      searchedLocations.push(location.trim());
      localStorage.setItem('searchedLocations', JSON.stringify(searchedLocations));
    }
     // Store the last searched location in local storage
     localStorage.setItem('lastLocation', location.trim());

  };

  return (
    <div>
      <h1>Enter Location</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
        />
        <button type="submit">Search</button>
      </form>
      {error && <p>{error}</p>}
      {weather && (
        <div>
          <h2>{weather.location?.name}</h2>
          <p>{weather.current?.temp_c}°C</p>
          {weather.current?.condition?.text && (
            <p>{weather.current.condition.text}</p>
          )}
        </div>        
      )}
      <div>
        <h2>List of Searched Locations</h2>
        <ul>
          {(JSON.parse(localStorage.getItem('searchedLocations') || '[]')).map((loc, index) => (
            <li key={index} onClick={() => searchWeather(loc)} style={{ cursor: 'pointer' }}>{loc}</li>
          ))}
        </ul>
      </div>
    </div>
    
  );
};

export default App;
