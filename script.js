const apiKey = "b8e99d5b5be54f1f969113215232506";
const baseURL = "http://api.weatherapi.com/v1";

const searchInput = document.getElementById("searchInput");
const searchSuggestions = document.querySelector(".search-suggestions");

document.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition);
  }
});

function getPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;

  let latlon = lat + "," + lon;

  getWeatherData(latlon);
}

const getWeatherData = async (location = "Istanbul") => {
  let url = `${baseURL}/forecast.json?key=${apiKey}&q=${location}&days=8`;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    showWeather(data);
  } catch (error) {
    console.log(error);
  }
};

getWeatherData();

function showWeather(data) {
  const city = document.querySelector(".city");
  const condition = document.getElementById("condition");
  const degree = document.getElementById("degree");
  const icon = document.getElementById("icon");
  const lastUpdated = document.querySelector(".last-updated");
  lastUpdated.innerHTML = "Last Updated : " + data.current.last_updated;

  city.innerText = data.location.name;
  condition.innerText = data.current.condition.text;
  degree.innerHTML = data.current.temp_c + " &deg;C";
  icon.src = "https:" + data.current.condition.icon;
  icon.alt = data.current.condition.text;

  const hoursToday = data.forecast.forecastday[0].hour;
  const hoursTomorrow = data.forecast.forecastday[1].hour;

  const d = new Date();
  let currentHour = d.getHours();

  let hours;

  if (currentHour !== 00) {
    const todaysHours = hoursToday.slice(currentHour); // remaining hours of the day
    const tomorrowsHours = hoursTomorrow.slice(0, currentHour); //hours of tomorrow

    hours = todaysHours.concat(tomorrowsHours);
  } else {
    hours = data.forecast.forecastday[0].hour;
  }

  let text = "";

  hours.forEach((element) => {
    let hour = element.time.split(" ")[1];
    let src = "https:" + element.condition.icon;
    let alt = element.condition.text;
    let degree = element.temp_c + " &deg;C";
    text += `
        <div class="hourly-forecast">
            <p class="hourly-time">${hour}</p>
            <img src=${src} alt=${alt} class="hourly-img" />
            <p class="hourly-deg">${degree}</p>
        </div> 
    `;
  });

  document.getElementById("hourly-div").innerHTML = text;

  const valuesOfConditions = document.querySelectorAll(".values-of-conditions");

  valuesOfConditions[0].innerHTML = data.current.feelslike_c + " &deg;C";

  valuesOfConditions[1].innerHTML = data.current.wind_kph + " km/h";

  valuesOfConditions[2].innerHTML =
    "% " + data.forecast.forecastday[0].day.daily_chance_of_rain;

  valuesOfConditions[3].innerHTML = data.current.uv;

  const days = data.forecast.forecastday;

  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let daysForecast = "";

  days.forEach((value, index) => {
    if (index === 0) return; // 0th index represents today, no need to take

    let d = new Date(value.date);
    let day = weekday[d.getDay()];

    let icon = "https:" + value.day.condition.icon;

    let cond = value.day.condition.text;

    let maxTemp = value.day.maxtemp_c;
    let minTemp = value.day.mintemp_c;

    daysForecast += `
        <div class="days">
            <p class="days-day">${day}</p>
            <img src=${icon} alt=${cond} class="days-img"/>
            <p class="days-case">${cond}</p>
            <p class="days-degrees">${maxTemp}/${minTemp} &deg;C</p>
        </div>
    `;
  });

  document.querySelector(".days-forecast").innerHTML = daysForecast;
}

const handleSearch = (e) => {
  if (e.target.value) {
    getSearchData(e.target.value);

    searchSuggestions.style.display = "block";
  } else {
    searchSuggestions.style.display = "none";
  }
};

searchInput.addEventListener("input", handleSearch);

async function getSearchData(location) {
  let url = `${baseURL}/search.json?key=${apiKey}&q=${location}`;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    const searchData = await response.json();
    showSearchSuggestions(searchData);
  } catch (error) {
    console.log(error);
  }
}

function showSearchSuggestions(searchData) {
  if (searchData.length) {
    let suggestions = "";
    searchData.forEach((value) => {
      suggestions += `
            <p onclick="handleSelectSug('${value.name}')">
                ${value.name}, ${value.region}, ${value.country}
            </p>
            `;
    });
    searchSuggestions.innerHTML = suggestions;
  }
}

function handleSelectSug(location) {
  getWeatherData(location);
  searchSuggestions.style.display = "none";
  searchInput.value = "";
}
