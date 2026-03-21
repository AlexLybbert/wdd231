const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';

const LAT = 38.9072;
const LON = -77.0369;
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

async function initWeather() {
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${WEATHER_BASE}/weather?lat=${LAT}&lon=${LON}&units=imperial&appid=${WEATHER_API_KEY}`),
      fetch(`${WEATHER_BASE}/forecast?lat=${LAT}&lon=${LON}&units=imperial&appid=${WEATHER_API_KEY}`)
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error(`Weather API error (${currentRes.status})`);
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    renderCurrentWeather(current);
    renderForecast(forecast);
  } catch (err) {
    console.error('Weather fetch failed:', err);
    const container = document.getElementById('weather-container');
    if (container) {
      container.innerHTML =
        '<p class="weather-error">Weather data is temporarily unavailable.</p>';
    }
  }
}

function renderCurrentWeather(data) {
  const temp     = Math.round(data.main.temp);
  const high     = Math.round(data.main.temp_max);
  const low      = Math.round(data.main.temp_min);
  const humidity = data.main.humidity;
  const desc     = data.weather[0].description;
  const icon     = data.weather[0].icon;
  const city     = data.name;

  const el = document.getElementById('weather-current');
  if (!el) return;

  el.innerHTML = `
    <p class="weather-location">${city}</p>
    <div class="weather-main">
      <img
        src="https://openweathermap.org/img/wn/${icon}@2x.png"
        alt="${desc}"
        class="weather-icon"
        width="72"
        height="72"
      >
      <div>
        <div class="weather-temp">${temp}°F</div>
        <div class="weather-desc">${desc}</div>
      </div>
    </div>
    <div class="weather-details">
      <span>High: ${high}°F</span>
      <span>Low: ${low}°F</span>
      <span>Humidity: ${humidity}%</span>
    </div>
  `;
}

function renderForecast(data) {
  const now      = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const dayMap = {};
  for (const item of data.list) {
    const [date, time] = item.dt_txt.split(' ');
    if (date === todayStr) continue;

    if (!dayMap[date] || time === '12:00:00') {
      dayMap[date] = item;
    }
  }

  const days = Object.values(dayMap).slice(0, 3);

  const el = document.getElementById('weather-forecast');
  if (!el) return;

  el.innerHTML = days.map(day => {
    const date     = new Date(day.dt * 1000);
    const dayName  = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const temp     = Math.round(day.main.temp);
    const high     = Math.round(day.main.temp_max);
    const low      = Math.round(day.main.temp_min);
    const icon     = day.weather[0].icon;
    const desc     = day.weather[0].description;

    return `
      <div class="forecast-card">
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-date">${monthDay}</div>
        <img
          src="https://openweathermap.org/img/wn/${icon}.png"
          alt="${desc}"
          class="forecast-icon"
          width="44"
          height="44"
          loading="lazy"
        >
        <div class="forecast-temp">${temp}°F</div>
        <div class="forecast-range">${high}° / ${low}°</div>
        <div class="forecast-desc">${desc}</div>
      </div>
    `;
  }).join('');
}

async function initSpotlights() {
  const container = document.getElementById('spotlights');
  if (!container) return;

  try {
    const response = await fetch('data/members.json');
    if (!response.ok) throw new Error(`Fetch failed (${response.status})`);

    const members = await response.json();

    const eligible = members.filter(m => m.membershipLevel >= 2);

    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }

    const count = Math.floor(Math.random() * 2) + 2;
    const spotlights = eligible.slice(0, Math.min(count, eligible.length));

    container.innerHTML = spotlights.map(m => {
      const isGold      = m.membershipLevel === 3;
      const levelLabel  = isGold ? 'Gold Member' : 'Silver Member';
      const levelClass  = isGold ? 'level-3' : 'level-2';
      const cardClass   = isGold ? 'gold' : 'silver';
      const websiteText = m.website.replace(/^https?:\/\//, '');

      return `
        <article class="spotlight-card ${cardClass}">
          <div class="spotlight-logo">
            <img
              src="images/${m.image}"
              alt="${m.companyName} logo"
              width="80"
              height="80"
              loading="lazy"
            >
          </div>
          <div class="spotlight-info">
            <h3 class="spotlight-name">${m.companyName}</h3>
            <p class="spotlight-phone">${m.phone}</p>
            <p class="spotlight-address">${m.address}</p>
            <a
              href="${m.website}"
              target="_blank"
              rel="noopener noreferrer"
              class="spotlight-website"
            >${websiteText}</a>
            <span class="member-badge ${levelClass} spotlight-badge">${levelLabel}</span>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('Spotlight fetch failed:', err);
    container.innerHTML = '<p class="notice">Unable to load member spotlights.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initWeather();
  initSpotlights();
});
