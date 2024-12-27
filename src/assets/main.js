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

export async function createGuestId() {
    const { data } = await api('authentication/guest_session/new');
    return data.guest_session_id;
}

export async function getTrendingMoviesPreview() {
    const { data: movies } = await api('trending/movie/day');
    const { data: series } = await api('trending/tv/day');

    trendingWrapperMovies.innerHTML = "";
    trendingWrapperSeries.innerHTML = "";
    trendingWrapperMovies.append(...makeMovieContainerX(movies));
    trendingWrapperSeries.append(...makeSeriesContainerX(series));
}

export async function getCategoriesPreview() {
    const { data } = await api('genre/movie/list');

    const allCategories = makeCategoryContainer(data?.genres);

    // console.log('allCategories :>> ', data?.genres);
    categoriesWrapperPreview.innerHTML = "";
    categoriesWrapperPreview.append(...allCategories);

}

export async function getRandomSeries() {
    const { data } = await api('genre/tv/list');
    let randomCategory = data.genres[getRandomInt(0, data.genres.length)];

    randomSectionTitle.innerHTML = randomCategory.name;
    let series = await innerFetch(randomCategory.id, 'tv');

    randomWrapperPreview.innerHTML = "";
    randomWrapperPreview.append(...makeSeriesContainerX(series));
}

export async function getRandomHeader() {
    const decider = Math.round(Math.random());
    headerRandomMenu.innerHTML = " ";
    headerRandomLabels.innerHTML = " ";

    const bookmark = document.createElement('i');
    bookmark.classList.add('far', 'fa-3x', 'fa-bookmark', 'interaction-menu__bookmark');

    const btn = document.createElement('button');
    btn.classList.add('interaction-menu__trailer-btn', 'trailer-btn');
    btn.innerText = 'Play Trailer';

    const moreInfoIcon = document.createElement('i');
    moreInfoIcon.classList.add('fas', 'fa-1x', 'fa-info', 'interaction-menu__more-info');
    const moreInfo = document.createElement('span');
    moreInfo.classList.add('icon-container');
    moreInfo.setAttribute('id', 'header-more-info');
    moreInfo.append(moreInfoIcon);

    const categoriesList = [];

    if (decider === 0) {
        const { data: genres } = await api('genre/movie/list');

        let randomCategory = genres.genres[getRandomInt(0, genres.genres.length)];
        let movies = await innerFetch(randomCategory.id, 'movie');
        let movie;

        do {
            movie = movies.results[getRandomInt(0, movies.results.length)];
        } while (movie.adult !== false);

        headerRandomTitle.innerText = movie.title;
        const movieImgUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        headerSection.style.backgroundImage = `
            linear-gradient(0deg,
            rgba(0, 0, 0, 0.75) 0%,
            rgba(92, 92, 92, 0.303) 33%,
            rgba(92, 92, 92, 0.303) 66%,
            rgba(0, 0, 0, 0.75) 100%),
            url('${movieImgUrl}')`;

        const { data: videoObject } = await api(`movie/${movie.id}`, {
            params: {
                append_to_response: 'videos',
            },
        });
        const videos = videoObject.videos.results;
        let videoKey;
        videos.forEach(video => {
            if (video.type === 'Trailer') {
                videoKey = video.key;
            }
        });

        const movieTrailerUrl = `https://www.youtube.com/embed/${videoKey}?modestbranding=1&fs=0`;
        btn.addEventListener('click', () => {
            const trailerEmbed = document.createElement('iframe');
            trailerEmbed.setAttribute('src', movieTrailerUrl);
            trailerEmbed.setAttribute('frameborder', 0);
            const arrow = document.createElement('i');
            arrow.classList.add('fas', 'fa-5x', 'fa-chevron-left', 'arrow-trailer');
            arrow.addEventListener('click', () => {
                headerTrailerContainer.innerHTML = '';
                enableScroll();
            });
            headerTrailerContainer.append(arrow, trailerEmbed);
            disableScroll();
        });

        moreInfo.addEventListener('click', () => {
            location.hash = `#details=movie+${movie.id}-${movie.title}`;
        });

        movie.genre_ids.forEach(categoryId => {
            const category = document.createElement('p');
            category.setAttribute('id', 'id' + categoryId);
            category.classList.add('category-label');
            category.innerText = `${getCategoryName(categoryId)}`;

            category.addEventListener('click', () => {
                location.hash = `#category=${categoryId}-${getCategoryName(categoryId)}`;
            });

            categoriesList.push(category);
        });
    } else {
        const { data: genres } = await api('genre/tv/list');
        let randomCategory = genres.genres[getRandomInt(0, genres.genres.length)];
        let series = await innerFetch(randomCategory.id, 'tv');
        let serie = series.results[getRandomInt(0, series.results.length)];

        headerRandomTitle.innerText = serie.name;
        const serieImgUrl = `https://image.tmdb.org/t/p/w500${serie.poster_path}`;
        headerSection.style.backgroundImage = `
            linear-gradient(0deg,
            rgba(0, 0, 0, 0.75) 0%,
            rgba(92, 92, 92, 0.303) 33%,
            rgba(92, 92, 92, 0.303) 66%,
            rgba(0, 0, 0, 0.75) 100%),
            url('${serieImgUrl}')`;

        const { data: videoObject } = await api(`tv/${serie.id}`, {
            params: {
                append_to_response: 'videos',
            },
        });
        const videos = videoObject.videos.results;
        let videoKey;
        videos.forEach(video => {
            if (video.type === 'Trailer') {
                videoKey = video.key;
            }
        });

        const serieTrailerUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&cc_load_policy=1&modestbranding=1&rel=0&fs=0`;
        btn.addEventListener('click', () => {
            const trailerEmbed = document.createElement('iframe');
            trailerEmbed.setAttribute('src', serieTrailerUrl);
            trailerEmbed.setAttribute('frameborder', 0);
            const arrow = document.createElement('i');
            arrow.classList.add('fas', 'fa-5x', 'fa-chevron-left', 'arrow-trailer');
            arrow.addEventListener('click', () => {
                headerTrailerContainer.innerHTML = '';
                enableScroll();
            });
            headerTrailerContainer.append(arrow, trailerEmbed);
            disableScroll();
        });

        moreInfo.addEventListener('click', () => {
            location.hash = `#details=serie+${serie.id}-${serie.name}`;
        });

        serie.genre_ids.forEach(categoryId => {
            const category = document.createElement('p');
            category.setAttribute('id', 'id' + categoryId);
            category.classList.add('category-label');
            category.innerText = `${getCategoryName(categoryId)}`;

            category.addEventListener('click', () => {
                location.hash = `#category=${categoryId}-${getCategoryName(categoryId)}`;
            });

            categoriesList.push(category);
        });
    }

    headerRandomMenu.innerHTML = " ";
    headerRandomLabels.innerHTML = " ";
    headerRandomLabels.append(...categoriesList);
    headerRandomMenu.append(btn);
}

export async function getTopRatedMoviesPreview() {
    const { data } = await api('movie/top_rated');

    topRatedWrapperPreview.innerHTML = "";
    topRatedWrapperPreview.append(...makeMovieContainerX(data));
}

export async function getMoviesByCategory(id) {
    const data = await requestMoviesByCategoryId(id);
    verticalMovieWrapperCategory.innerHTML = " ";
    verticalMovieWrapperCategory.append(...makeMixedContainerY(data))
}

export async function getMoviesBySearch(query) {
    const { data } = await api('/search/multi', {
        params: {
            query,
        },
    });

    verticalMovieWrapperSearch.innerHTML = " ";
    verticalMovieWrapperSearch.append(...makeMixedContainerY(data));
}

export async function getDetailsById(id, media) {
    try {
        if (media === 'movie') {
            getMovieById(id);
        } else {
            getSerieById(id);
        }
    } catch (error) {
        console.log('it fails when reload');
    }
}

export async function getRelatedContentById(id, media) {
    try {
        if (media === 'movie') {
            getMoviesRelated(id);
        } else {
            getSeriesRelated(id);
        }
    } catch (error) {
        console.log('it fails when reload');
    }
}

export async function getWatchlist() {
    // const {data} = await api(`account/${sessionId}/watchlist/movies`);
    // console.log('data :>> ', data);

    // I just read the doc about the api and it doesn't allow save to any list
    // with a guest id, so I got to remove the feature or make a login in the future
}

// export async function getAllMovies() {
//     // const disclaimer = document.createElement('h2');
//     // disclaimer.classList.add('main-section__title');
//     // disclaimer.innerText = "Sorry. this feature isn't avaible right now";
//     // const arrow = document.createElement('i');
//     // // const art = document.createElement('article');
//     // arrow.classList.add('fas', 'fa-5x', 'fa-chevron-left', 'arrow-trailer');
//     // arrow.addEventListener('click', () => {
//     //     location.hash = '#home';
//     // });
//     // mainSection.append(arrow, disclaimer);

//     // const sectionsList = [];
//     // const { data: categories } = await api('genre/movie/list');
//     // categories.genres.forEach(genre => {
//     //     const section = document.createElement('section');
//     //     let container = document.createElement('div');
//     //     const title = document.createElement('h2');
//     //     section.classList.add('main-section');
//     //     container.classList.add('main-section__poster-container', 'poster-container');
//     //     title.classList.add('main-section__title', `main-section__title--${genre.name.replaceAll(' ', '-')}`);

//     //     title.innerText = genre.name;
//     //     requestMoviesByCategoryId(genre.id)
//     //         .then(result => {
//     //             container = makeMovieContainerX(result);
//     //         });

//     //     section.append(title, container);
//     //     sectionsList.push(section);
//     // });
//     // art.append(...sectionsList);
//     // mainSection.append(arrow, art);
// }

// Aux fn

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function makeCategoryContainer(array) {
    const container = [];
    for (let index = 0; index < array.length; index++) {
        // const category = `<a href="#"><span id="${array[index].id}" class="category">${array[index].name}</span></a>`;

        const category = document.createElement('div');
        const label = document.createElement('p');

        // console.log(array[index].id, array[index].name);
        label.innerText = `${array[index].name}`;
        category.addEventListener('click', () => {
            location.hash = `#category=${array[index].id}-${array[index].name}`;
        });

        category.setAttribute('id', 'id' + array[index].id);
        category.classList.add('category');

        category.append(label);
        container.push(category);
    }

    return container;
}

function makeCategoryLabelsContainerLimited(array, limit) {
    const container = [];
    for (let index = 0; index < limit; index++) {
        // const category = `<a href="#"><span id="${array[index].id}" class="category">${array[index].name}</span></a>`;

        // const category = document.createElement('a');
        // category.href = "#";

        const category = document.createElement('p');
        category.setAttribute('id', 'id' + array[index].id);
        category.classList.add('category-label');
        category.innerText = `${array[index].name}`;
        category.addEventListener('click', () => {
            // console.log(array[index].id, array[index].name);
            location.hash = `#category=${array[index].id}-${array[index].name}`;
        });

        container.push(category);
    }
    return container;
}

function makeMovieContainerX(data) {
    const allMovies = [];
    const movies = data.results;

    movies.forEach(movie => {
        // let moviePreview = `<img class="poster-container__img" src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">`;
        let moviePreview = document.createElement('img');
        moviePreview.classList.add('poster-container__img')
        moviePreview.setAttribute('id', `${movie.id}`);
        moviePreview.setAttribute('alt', movie.title);
        moviePreview.setAttribute('src', `https://image.tmdb.org/t/p/w300${movie.poster_path}`);

        moviePreview.addEventListener('click', () => {
            location.hash = `#details=movie+${movie.id}-${movie.title}`;
            headerTrailerContainer.innerHTML = '';
        });

        allMovies.push(moviePreview);
    });

    return allMovies;
}

function makeSeriesContainerX(data) {
    const allSeries = [];
    const series = data.results;

    series.forEach(serie => {
        // let moviePreview = `<img class="poster-container__img" src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">`;
        let seriePreview = document.createElement('img');
        seriePreview.classList.add('poster-container__img')
        seriePreview.setAttribute('data-type', 'serie');
        seriePreview.setAttribute('id', `${serie.id}`);
        seriePreview.setAttribute('alt', serie.name);
        seriePreview.setAttribute('src', `https://image.tmdb.org/t/p/w300${serie.poster_path}`);

        seriePreview.addEventListener('click', () => {
            location.hash = `#details=tv+${serie.id}-${serie.name}`;
            headerTrailerContainer.innerHTML = '';
        });

        allSeries.push(seriePreview);
    });

    return allSeries;
}

function makeMixedContainerY(data) {
    const allContents = [];
    const contents = data.results;

    contents.forEach(content => {
        // let moviePreview = `<img class="poster-container__img" src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">`;

        let contentPreview = document.createElement('img');
        contentPreview.classList.add('poster-wrapper__img');

        contentPreview.setAttribute('alt', content.title);
        contentPreview.setAttribute('src', `https://image.tmdb.org/t/p/w300${content.poster_path}`);

        if (content.title == undefined) {
            contentPreview.setAttribute('alt', 'broken');
        }

        if (content.media_type === 'movie') {
            contentPreview.addEventListener('click', () => {
                location.hash = `#details=movie+${content.id}-${content.title}`;
                headerTrailerContainer.innerHTML = '';
            });
        } else if (content.media_type === 'tv') {
            contentPreview.addEventListener('click', () => {
                location.hash = `#details=tv+${content.id}-${content.name}`;
                headerTrailerContainer.innerHTML = '';
            });
        } else {
            contentPreview.addEventListener('click', () => {
                location.hash = `#details=movie+${content.id}-${content.title}`;
                headerTrailerContainer.innerHTML = '';
            });
        }
        allContents.push(contentPreview);
    });
    return allContents;
}

async function getMovieById(id) {
    const { data: movie } = await api(`movie/${id}`, {
        params: {
            append_to_response: 'videos',
        },
    });

    const movieImgUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    headerSection.style.backgroundImage = `
    linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(255,255,255,0) 16%),
    url('${movieImgUrl}')`;

    const videos = movie.videos.results;
    let videoKey;
    videos.forEach(video => {
        if (video.type === 'Trailer') {
            videoKey = video.key;
        }
    });

    const btn = document.createElement('button');
    btn.setAttribute('id', 'button-trailer');
    btn.classList.add('more-details__trailer-btn');
    btn.classList.add('trailer-btn');
    btn.innerText = 'Play Trailer';

    const paragraph = document.createElement('p');
    paragraph.setAttribute('id', 'details-section-overview');

    const movieTrailerUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&cc_load_policy=1&modestbranding=1&rel=0&fs=0`;
    btn.addEventListener('click', () => {
        footerSection.classList.add('footer--trailer');
        mainSection.classList.add('main-details--trailer');
        const trailerEmbed = document.createElement('iframe');
        trailerEmbed.setAttribute('src', movieTrailerUrl);
        trailerEmbed.setAttribute('frameborder', 0);
        const arrow = document.createElement('i');
        arrow.classList.add('fas', 'fa-5x', 'fa-chevron-left', 'arrow-trailer');
        arrow.addEventListener('click', () => {
            headerTrailerContainer.innerHTML = '';
            footerSection.classList.remove('footer--trailer');
            mainSection.classList.remove('main-details--trailer');
        });
        headerTrailerContainer.append(arrow, trailerEmbed);
    });

    detailsVote.innerText = `${Math.round(movie.vote_average * 1000) / 100}%`;

    let categoriesList = makeCategoryLabelsContainerLimited(movie.genres, 2);
    detailsCategories.innerHTML = "";
    detailsCategories.append(...categoriesList);

    overviewContainer.innerHTML = "";
    overviewContainer.append(btn, paragraph);

    paragraph.innerText = movie.overview;
}

async function getSerieById(id) {
    const { data: serie } = await api(`tv/${id}`, {
        params: {
            append_to_response: 'videos',
        },
    });

    const serieImgUrl = `https://image.tmdb.org/t/p/w500${serie.poster_path}`
    headerSection.style.backgroundImage = `
    linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(255,255,255,0) 16%),
    url('${serieImgUrl}')`

    const videos = serie.videos.results;
    let videoKey;
    try {
        videos.forEach(video => {
            if (video.type === 'Trailer') {
                videoKey = video.key;
            }
        });
    } catch (error) {
        videoKey = videos[0].key;
    }

    // <button id="button-trailer" type="button" class="more-details__trailer-btn trailer-btn">Play Trailer</button>
    // <p id="details-section-overview"></p>

    const btn = document.createElement('button');
    btn.setAttribute('id', 'button-trailer');
    btn.classList.add('more-details__trailer-btn');
    btn.classList.add('trailer-btn');
    btn.innerText = 'Play Trailer';

    const paragraph = document.createElement('p');
    paragraph.setAttribute('id', 'details-section-overview');

    const serieTrailerUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&cc_load_policy=1&modestbranding=1&rel=0&fs=0`;
    btn.addEventListener('click', () => {
        footerSection.classList.add('footer--trailer');
        mainSection.classList.add('main-details--trailer');
        const trailerEmbed = document.createElement('iframe');
        trailerEmbed.setAttribute('src', serieTrailerUrl);
        trailerEmbed.setAttribute('frameborder', 0);
        const arrow = document.createElement('i');
        arrow.classList.add('fas', 'fa-5x', 'fa-chevron-left', 'arrow-trailer');
        arrow.addEventListener('click', () => {
            headerTrailerContainer.innerHTML = '';
            footerSection.classList.remove('footer--trailer');
            mainSection.classList.remove('main-details--trailer');
        });
        headerTrailerContainer.append(arrow, trailerEmbed);
    });

    detailsVote.innerText = `${Math.round(serie.vote_average * 1000) / 100}%`;

    try {
        let categoriesList = makeCategoryLabelsContainerLimited(serie.genres, 2);
        detailsCategories.innerHTML = "";
        detailsCategories.append(...categoriesList);
    } catch (error) {
        let categoriesList = makeCategoryLabelsContainerLimited(serie.genres, 1);
        detailsCategories.innerHTML = "";
        detailsCategories.append(...categoriesList);
    }

    overviewContainer.innerHTML = "";
    overviewContainer.append(btn, paragraph);

    paragraph.innerText = serie.overview;
}

async function getMoviesRelated(id) {
    const { data } = await api(`movie/${id}/recommendations`);

    detailsRelatedContent.innerHTML = "";
    detailsRelatedContent.append(...makeMovieContainerX(data));
}

async function getSeriesRelated(id) {
    const { data } = await api(`tv/${id}/recommendations`);

    detailsRelatedContent.innerHTML = "";
    detailsRelatedContent.append(...makeSeriesContainerX(data));
}

async function innerFetch(id, media_type) {
    const { data } = await api(`/discover/${media_type}`, {
        params: {
            with_genres: id,
            include_adult: false,
        },
    });
    return data;
}

function getCategoryName(id) {
    switch (id) {
        case 28:
            return 'Action'
            break;
        case 12:
            return 'Adventure'
            break;
        case 16:
            return 'Animation'
            break;
        case 35:
            return 'Comedy'
            break;
        case 80:
            return 'Crime'
            break;
        case 99:
            return 'Documentary'
            break;
        case 18:
            return 'Drama'
            break;
        case 10751:
            return 'Family'
            break;
        case 14:
            return 'Fantasy'
            break;
        case 36:
            return 'History'
            break;
        case 27:
            return 'Horror'
            break;
        case 10402:
            return 'Music'
            break;
        case 9648:
            return 'Mistery'
            break;
        case 10749:
            return 'Romance'
            break;
        case 878:
            return 'Science Fiction'
            break;
        case 10770:
            return 'Tv Movie'
            break;
        case 53:
            return 'Thriller'
            break;
        case 10752:
            return 'War'
            break;
        case 37:
            return 'Western'
            break;
        case 37:
            return 'Action & Adventure'
            break;
        case 10762:
            return 'Kids'
            break;
        case 10763:
            return 'News'
            break;
        case 10764:
            return 'Reality'
            break;
        case 10765:
            return 'Sci-Fi & Fantasy'
            break;
        case 10766:
            return 'Soap'
            break;
        case 10767:
            return 'Talk'
            break;
        case 10768:
            return 'War & Politics'
            break;
        default:
            return null;
            break;
    }
}

async function addToWatchlist(content_type, content_id) {
    const { data } = api(`account/${sessionId}/watchlist`, {
        method: 'POST',
        body: {
            'media_type': content_type,
            'media_id': content_id,
            'watchlist': true
        }
    });
    console.log('data :>> ', data);
    getWatchlist();
}

function disableScroll() {
    // window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    // window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

function enableScroll() {
    // window.removeEventListener('DOMMouseScroll', preventDefault, false);
    // window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
    window.removeEventListener('touchmove', preventDefault, wheelOpt);
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

async function requestMoviesByCategoryId(id) {
    const { data } = await api('/discover/movie', {
        params: {
            with_genres: id,
        },
    });
    return data;
}