import { API_KEY } from "./env.js";
const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    params: {
        'api_key': API_KEY,
    },
});

export async function getTrendingMoviesPreview() {
    const {data} = await api('trending/all/day');
    const allMovies = [];
    const movies = data.results;

    movies.forEach(movie => {
        let moviePreview = `<img class="poster-container__img" src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">`;
        allMovies.push(moviePreview);
    });

    let container = document.getElementById('trending-section');
    container.innerHTML = allMovies.join('');
}

export async function getCategoriesPreview() {
    const {data} = await api('genre/movie/list');

    const allMovies = makeCategoryContainer(data?.genres);
    // const tvCategories = makeCategoryContainer(dataTV?.genres);

    let moviesCategories = allMovies.splice(0, 9);
    let moviesCategories2 = allMovies.splice(0, 10);

    const moviesContainer = document.getElementById('movies-categories-container-1');
    const moviesContainer2 = document.getElementById('movies-categories-container-2');
    // const tvContainer = document.getElementById('tv-categories-container');

    moviesContainer.innerHTML = moviesCategories.join('');
    moviesContainer2.innerHTML = moviesCategories2.join('');
}

export async function getRandomSeries() {
    const {data} = await api('genre/tv/list');

    console.log(data);
}

export async function getTopRatedMoviesPreview() {
    const {data} = await api('movie/top_rated');
    const allMovies = [];
    const movies = data.results;

    movies.forEach(movie => {
        let moviePreview = `<img class="poster-container__img" src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">`;
        allMovies.push(moviePreview);
    });

    let container = document.getElementById('top-rated-section');
    container.innerHTML = allMovies.join('');
}

// Aux fn
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function makeCategoryContainer(array) {
    const container = [];
    for (let index = 0; index < array.length; index++) {
        const category = `<a href="#"><span class="category">${array[index].name}</span></a>`;
        container.push(category);
    }
    return container;
}