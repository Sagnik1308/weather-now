import { useState } from "react";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError("");
      setWeather(null);

      // Step 1: Get latitude/longitude for the city
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found!");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = geoData.results[0];

      // Step 2: Fetch weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m`
      );

      const weatherData = await weatherRes.json();

      // Find the latest humidity value from hourly data
      const humidityArray = weatherData.hourly?.relative_humidity_2m;
      const humidity = humidityArray ? humidityArray[humidityArray.length - 1] : "N/A";

      // Merge humidity into weather object
      setWeather({
        ...weatherData.current_weather,
        humidity,
      });

    } catch (err) {
      setError("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️ Clear sky";
    if (code >= 1 && code <= 3) return "🌤️ Partly cloudy";
    if (code >= 45 && code <= 48) return "🌫️ Fog";
    if (code >= 51 && code <= 67) return "🌧️ Drizzle/Rain";
    if (code >= 71 && code <= 77) return "❄️ Snow";
    if (code >= 80 && code <= 82) return "🌦️ Showers";
    if (code >= 95 && code <= 99) return "⛈️ Thunderstorm";
    return "🌈 Unknown";
  };

  const formatLocalTime = (utcString) => {
    if (!utcString) return "";
    const date = new Date(utcString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">Weather Now 🌤️</h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 w-full max-w-lg">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
        />

        <button
          onClick={fetchWeather}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {weather && (
        <div className="bg-white shadow-lg rounded-xl p-6 mt-4 text-center">
          <p className="text-2xl mb-2">{getWeatherIcon(weather.weathercode)}</p>
          <p className="text-sm text-gray-600 mb-3">
            Last updated: {formatLocalTime(weather.time)}
          </p>

          <p className="text-lg font-medium">
            🌡️ Temperature: {weather.temperature}°C
          </p>
          <p className="text-lg font-medium">
            💨 Wind Speed: {weather.windspeed} km/h
          </p>
          <p className="text-lg font-medium">
            🧭 Wind Direction: {weather.winddirection}°
          </p>
          <p className="text-lg font-medium">
            💧 Humidity: {weather.humidity}%
          </p>
        </div>
      )}

      <footer className="mt-8 text-sm text-gray-600">
        Data from{" "}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-700"
        >
          Open-Meteo API
        </a>
      </footer>


    </div>
  );
}
