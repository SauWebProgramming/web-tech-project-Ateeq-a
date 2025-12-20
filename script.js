/* === JavaScript Logic: Hero Slider, Favorites, Filter === */

const movieContainer = document.getElementById('movie-container');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const genreFilter = document.getElementById('genreFilter');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body'); 
const closeBtn = document.querySelector('.close-btn');

const homeBtn = document.getElementById('homeBtn');
const favBtn = document.getElementById('favBtn');

// Hero Slider Elements
const heroBg = document.getElementById('heroBg');
const heroImage = document.getElementById('heroImage');
const heroTitle = document.getElementById('heroTitle');
const heroDesc = document.getElementById('heroDesc');
const heroMeta = document.getElementById('heroMeta');

let allMovies = [];
let sliderMovies = [];
let currentSlide = 0;

// === 1. Fetch & Init ===
async function fetchMovies() {
    try {
        const response = await fetch('movies.json');
        if (!response.ok) throw new Error('Failed to fetch');
        allMovies = await response.json();
        
        // إعداد السلايدر (أول 5 أفلام)
        sliderMovies = allMovies.slice(0, 5);
        updateSlider();
        
        displayMovies(allMovies);
    } catch (error) {
        console.error('Error:', error);
    }
}

// === 2. Slider Logic ===
function updateSlider() {
    if (sliderMovies.length === 0) return;
    const movie = sliderMovies[currentSlide];
    heroBg.style.backgroundImage = `url('${movie.image}')`;
    heroImage.src = movie.image;
    heroImage.alt = movie.title;
    heroTitle.innerText = movie.title;
    heroDesc.innerText = movie.desc;
    heroMeta.innerText = `⭐ ${movie.rating} | ${movie.type} | ${movie.genre}`;
}

function moveSlide(direction) {
    if (sliderMovies.length === 0) return;
    currentSlide = (currentSlide + direction + sliderMovies.length) % sliderMovies.length;
    updateSlider();
}

// تشغيل السلايدر تلقائياً
setInterval(() => moveSlide(1), 5000);

// === 3. Display & Filter ===
function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedGenre = genreFilter.value;

    const filtered = allMovies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesType = selectedType === 'all' || movie.type === selectedType;
        const matchesGenre = selectedGenre === 'all' || movie.genre.includes(selectedGenre);
        return matchesSearch && matchesType && matchesGenre;
    });
    displayMovies(filtered);
}

function displayMovies(movies) {
    movieContainer.innerHTML = '';
    
    if (movies.length === 0) {
        movieContainer.innerHTML = '<p style="text-align:center; width:100%; color:#ccc; grid-column: 1 / -1; padding: 20px;">No matches found.</p>';
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.innerHTML = `
            <span class="rating">⭐ ${movie.rating}</span>
            <img src="${movie.image}" alt="${movie.title}">
            <div class="movie-card-info">
                <h3>${movie.title}</h3>
                <p style="color:#e94560; font-size:0.8rem;">${movie.type}</p>
                <p style="font-size:0.8rem; color:#aaa;">${movie.genre}</p>
            </div>
        `;
        card.addEventListener('click', () => openModal(movie));
        movieContainer.appendChild(card);
    });
}

// === 4. Modal & Favorites ===
function openModal(movie) {
    const favorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
    const isFav = favorites.some(fav => fav.id === movie.id);
    const btnText = isFav ? "Remove from Favorites ❌" : "Add to Favorites ❤️";
    const btnColor = isFav ? "#555" : "#e94560";

    modalBody.innerHTML = `
        <div class="modal-img-container">
            <img src="${movie.image}" alt="${movie.title}">
        </div>
        <div class="modal-info">
            <div class="modal-tags">
                <span class="modal-tag">${movie.type}</span>
                <span class="modal-tag">${movie.year}</span>
                <span class="modal-tag">⭐ ${movie.rating}</span>
            </div>
            <h2>${movie.title}</h2>
            <p><strong>Genre:</strong> ${movie.genre}</p>
            <p>${movie.desc}</p>
            <button id="modalFavBtn" class="fav-btn" style="background-color:${btnColor}">
                ${btnText}
            </button>
        </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('modalFavBtn').onclick = () => toggleFavorite(movie);
}

function toggleFavorite(movie) {
    let favorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
    const index = favorites.findIndex(fav => fav.id === movie.id);
    
    if (index === -1) {
        favorites.push(movie);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('myFavorites', JSON.stringify(favorites));
    openModal(movie); 
    
    if (favBtn.classList.contains('active')) {
        showFavorites();
    }
}

// === 5. Navigation ===
homeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    homeBtn.classList.add('active');
    favBtn.classList.remove('active');
    document.getElementById('heroSlider').style.display = 'flex';
    document.querySelector('.filter-bar').style.display = 'block';
    displayMovies(allMovies);
});

favBtn.addEventListener('click', (e) => {
    e.preventDefault();
    favBtn.classList.add('active');
    homeBtn.classList.remove('active');
    showFavorites();
});

function showFavorites() {
    document.getElementById('heroSlider').style.display = 'none';
    document.querySelector('.filter-bar').style.display = 'none';
    
    const favorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
    
    if (favorites.length === 0) {
        movieContainer.innerHTML = `
            <div style="text-align:center; width:100%; padding:50px; grid-column: 1 / -1;">
                <h2 style="color:#e94560; margin-bottom:10px;">No favorites yet 💔</h2>
                <p style="color:#ccc;">Go back home and add some movies to your list!</p>
            </div>
        `;
    } else {
        displayMovies(favorites);
    }
}

closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

searchInput.addEventListener('input', filterMovies);
typeFilter.addEventListener('change', filterMovies);
genreFilter.addEventListener('change', filterMovies);

fetchMovies();