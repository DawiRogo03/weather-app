const button = document.getElementById("searchBtn");
const API_KEY = "21d83297b909ae41d975a375fc1e9f96";
window.addEventListener("load", () => {
    const savedCity = localStorage.getItem("lastCity");

    if (savedCity) {
        document.getElementById("cityInput").value = savedCity;
        getWeather();
    }
});

button.addEventListener("click", getWeather);

function getWeatherIcon(main) {
    switch (main) {
        case "Clear":
            return "☀️";
        case "Clouds":
            return "☁️";
        case "Rain":
            return "🌧️";
        case "Drizzle":
            return "🌦️";
        case "Thunderstorm":
            return "⛈️";
        case "Snow":
            return "❄️";
        default:
            return "🌡️";
    }
}

async function getWeather() {

    const city = document.getElementById("cityInput").value.trim();

    if (!city) {
        alert("Wpisz nazwę miasta");
        return;
    }
    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;

    const loading = document.getElementById("loading");
    loading.style.display = "block";

    try {

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        document.getElementById("cityName").textContent = data.name;

        document.getElementById("temperature").textContent =
            `Temperatura: ${data.main.temp}°C`;

        document.getElementById("humidity").textContent =
            `Wilgotność: ${data.main.humidity}%`;

        document.getElementById("description").textContent =
            `Opis: ${data.weather[0].description}`;

        document.getElementById("weatherIcon").textContent =
            getWeatherIcon(data.weather[0].main);

        document.body.className = "";
        const weather = data.weather[0].main;

        if (weather === "Clear") document.body.classList.add("sunny");
        if (weather === "Clouds") document.body.classList.add("clouds");
        if (weather === "Rain") document.body.classList.add("rain");
        if (weather === "Snow") document.body.classList.add("snow");

        localStorage.setItem("lastCity", city);

        getForecast(city);

    } catch (error) {

        console.error(error);
        alert(error.message);

    } finally {

        loading.style.display = "none";
    }
}


async function getForecast(city) {

    const url =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${geoApiKey}&units=metric&lang=pl`;

    const res = await fetch(url);
    const data = await res.json();

    const box = document.getElementById("forecast");
    box.innerHTML = "";

    const daily = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    daily.forEach(day => {

        const div = document.createElement("div");

        div.innerHTML = `
            <p><b>${day.dt_txt.split(" ")[0]}</b></p>
            <p>${day.main.temp}°C</p>
            <p>${day.weather[0].description}</p>
        `;

        box.appendChild(div);
    });
}

async function getCities(query) {
    if (!query) return;

    const url =
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${geoApiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    const box = document.getElementById("suggestions");
    box.innerHTML = "";

    data.forEach(city => {
        const div = document.createElement("div");
        div.classList.add("suggestion");

        div.textContent = `${city.name}, ${city.country}`;

        div.onclick = () => {
            document.getElementById("cityInput").value = city.name;
            box.innerHTML = "";
            getWeather();
        };

        box.appendChild(div);
    });
}
let timeout;

document.getElementById("cityInput").addEventListener("input", (e) => {

    clearTimeout(timeout);

    timeout = setTimeout(() => {
        getCities(e.target.value);
    }, 500);

});

document.getElementById("cityInput").addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        getWeather();
    }

});
