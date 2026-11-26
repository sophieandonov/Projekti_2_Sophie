/**
 * TMDB API -asetukset
 * Hanki oma ilmainen API-avain osoitteesta: https://www.themoviedb.org/settings/api
 */
const API_KEY = 'LISÄÄ_OMA_TMDB_API_AVAIN_TÄHÄN';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Haetaan viittaukset HTML-elementteihin
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const moviesGrid = document.getElementById('movies-grid');
const statusMessage = document.getElementById('status-message');

/**
 * 1. & 2. AJAX-kutsu palvelimelle (Fetch API) ja datan tallennus muuttujaan
 * @param {string} endpoint - API:n polku (esim. '/movie/popular' tai '/search/movie')
 * @param {string} queryParams - Mahdolliset lisäparametrit, kuten hakusana
 */
async function fetchMovies(endpoint, queryParams = '') {
    // Näytetään käyttäjälle latausilmoitus
    statusMessage.textContent = 'Haetaan elokuvia palvelimelta...';
    moviesGrid.innerHTML = '';

    // Rakennetaan täydellinen osoite TMDB-palvelimelle
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=fi-FI${queryParams}`;

    try {
        // 1. Lähetetään asynkroninen AJAX-pyyntö live-palvelimelle
        const response = await fetch(url);

        // Tarkistetaan, onnistuiko HTTP-pyyntö (status 200-299)
        if (!response.ok) {
            throw new Error(`Virhe palvelinyhteydessä (Status: ${response.status})`);
        }

        // 2. Tallennetaan palvelimen palauttama JSON-data muuttujaan
        const data = await response.json();

        // Valitaan datasta vain elokuvataulukko (results)
        const moviesList = data.results;

        // Kutsutaan funktiota, joka piirtää valitun datan ruudulle
        renderMovies(moviesList);

    } catch (error) {
        console.error('Virhe datan haussa:', error);
        statusMessage.textContent = 'Tietojen haku epäonnistui. Tarkista API-avain ja verkkoyhteys.';
    }
}

/**
 * 3. Valitun datan näyttäminen selaimessa visuaalisina kortteina
 * @param {Array} movies - Taulukko elokuvaobjekteja
 */
function renderMovies(movies) {
    // Tyhjennetään tilaviesti ja aiemmat tulokset
    statusMessage.textContent = '';
    moviesGrid.innerHTML = '';

    // Jos hakutuloksia ei löytynyt
    if (!movies || movies.length === 0) {
        statusMessage.textContent = 'Hakuehdoilla ei löytynyt yhtään elokuvaa.';
        return;
    }

    // Käydään läpi jokainen elokuva ja poimitaan tarvittavat kentät
    movies.forEach((movie) => {
        // Poimitaan halutut tiedot objektista
        const title = movie.title;
        const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'Tuntematon';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'Ei arviota';
        const overview = movie.overview || 'Ei suomenkielistä kuvausta saatavilla.';
        
        // Muodostetaan julisteen kuvaosoite (tai käytetään varakuvaa, jos juliste puuttuu)
        const posterUrl = movie.poster_path 
            ? `${IMAGE_BASE_URL}${movie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=Ei+kuvaa';

        // Luodaan elokuvakortti-elementti dynaamisesti
        const card = document.createElement('article');
        card.classList.add('movie-card');

        card.innerHTML = `
            <img src="${posterUrl}" alt="${title}" class="movie-poster" loading="lazy">
            <div class="movie-info">
                <div class="movie-header">
                    <h2 class="movie-title">${title}</h2>
                    <span class="movie-rating">★ ${rating}</span>
                </div>
                <p class="movie-year">Julkaisuvuosi: ${releaseYear}</p>
                <p class="movie-overview">${overview}</p>
            </div>
        `;

        // Lisätään valmis kortti ruudukkoon
        moviesGrid.appendChild(card);
    });
}

/**
 * 4. Kaikki tapahtumankäsittelijät (Event Handlers) lisätään dynaamisesti
 */
function initEventListeners() {
    // Lomakkeen lähetys (hakukenttä + Hae-nappi)
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Estetään sivun uudelleenlataus
        const query = searchInput.value.trim();

        if (query !== '') {
            // Haetaan elokuvia hakusanalla
            fetchMovies('/search/movie', `&query=${encodeURIComponent(query)}`);
        }
    });

    // Pudotusvalikon (select) muutos
    categorySelect.addEventListener('change', (event) => {
        const selectedCategory = event.target.value;
        searchInput.value = ''; // Tyhjennetään tekstihaku selkeyden vuoksi
        fetchMovies(`/movie/${selectedCategory}`);
    });
}

// Käynnistetään sovellus, kun DOM on latautunut
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    // Ladataan oletuksena suosituimmat elokuvat sivun avautuessa
    fetchMovies('/movie/popular');
});