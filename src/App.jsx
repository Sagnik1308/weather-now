import { useState } from "react";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transitioning, setTransitioning] = useState(false);


  const fetchWeather = async () => {
    try {
      setTransitioning(false);
      setLoading(true);
      setError("");
      setWeather(null);

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

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      const humidityArray = weatherData.hourly?.relative_humidity_2m;
      const humidity = humidityArray
        ? humidityArray[humidityArray.length - 1]
        : "N/A";

      // short fade transition before showing weather
      setTransitioning(true);
      setTimeout(() => {
        setWeather({
          ...weatherData.current_weather,
          humidity,
        });
        setLoading(false);
        setTransitioning(false);
      }, 400); // matches fadeOut duration
    } catch (err) {
      setError("Something went wrong. Try again!");
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
  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">Weather Now 🌤️</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchWeather();
        }}
        className="flex flex-col sm:flex-row gap-2 mb-4 w-full max-w-md"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95"
        >
          Search
        </button>
      </form>


      {loading && (
        <div
          className={`bg-white shadow-lg rounded-xl p-6 mt-4 w-80 sm:w-96 ${transitioning ? "animate-fadeOut" : "animate-shimmer"
            }`}
        >
          <div className="h-6 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded mb-4"></div>
          <div className="h-4 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded mb-2"></div>
          <div className="h-4 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded mb-2"></div>
          <div className="h-4 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded"></div>
        </div>
      )}



      {error && <p className="text-red-600">{error}</p>}

      {weather && (
        <div
          key={weather.time}
          className="bg-white shadow-lg rounded-xl p-6 mt-4 text-center animate-fadeIn"
        >

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
