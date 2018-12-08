let verv0022 = (function () {

    /* globals APIKEY */



    const movieDataBaseURL = "https://api.themoviedb.org/3/";
    let imageURL = null;
    let imageSizes = [];
    let searchString = "";
    let imageURLKey = "imageURL";
    let imageSizesKey = "imageSizesKey";
    let timeKey = "timeKey";
    let staleDataTimeOut = 60;



    document.addEventListener("DOMContentLoaded", init);

    function init() {

        //    console.log(APIKEY);
        addEventListeners();


        getLocalStorageData();

        getPosterSizesAndURL();

        goBack();
        
     

    }


    function addEventListeners() {
        let searchButton = document.querySelector(".searchButtonDiv");
        let enterSearch = document.getElementById("search-input");
        let switchPages = document.querySelector(".searchButtonDiv")

        searchButton.addEventListener("click", startSearch);

        enterSearch.addEventListener("keypress", enterPress);

        switchPages.addEventListener("click", pageSwitch);




    }

    function getLocalStorageData() {


        if (localStorage.getItem(imageURLKey) && localStorage.getItem(imageURLKey)) {

            imageURL = JSON.parse(localStorage.getItem(imageURLKey));
            imageSizes = JSON.parse(localStorage.getItem(imageSizesKey));

            if (localStorage.getItem(timeKey)) {
                let savedDate = localStorage.getItem(timeKey); // get the saved date
                savedDate = new Date(savedDate); // create new date object using the saved date
                console.log(savedDate);

                let now = new Date(); /// get the current date/time
                console.log(now);

                let minutes = calculatedElapsedTime(savedDate);

                if (minutes > staleDataTimeOut) {
                    console.log("Local Storage Data is stale, performing new Fetch Update");
                    getPosterSizesAndURL();
                }
            }
        } else {

            saveDataToLocalStorage();
        }
    }

    function saveDataToLocalStorage() {
        console.log("Saving current Date to Local Storage");
        let now = new Date();
        localStorage.setItem(timeKey, now);
    }

    function calculatedElapsedTime(saveDate) {
        let now = new Date(); //get current time
        console.log(now);

        let elapsedTime = now.getTime() - saveDate.getTime();

        let minutes = Math.ceil(elapsedTime / 60);
        console.log("Elapsed Time: " + minutes + "minutes");
        return minutes;
    }

    function getPosterSizesAndURL() {

        let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;

        fetch(url)
            .then(function (response) {
                return response.json();

            })

            .then(function (data) {
                console.log(data);
                imageURL = data.images.secure_base_url;
                imageSizes = data.images.poster_sizes;

                localStorage.setItem(imageURLKey, JSON.stringify(imageURL));
                localStorage.setItem(imageSizesKey, JSON.stringify(imageSizes));

                console.log("Image URL and Size Data saved to Local Storage");
                console.log(imageURL);
                console.log(imageSizes);

                let now = new Date();
                localStorage.setItem(timeKey, now);

            })

            .catch(function (error) {
                alert(error);

            })

    }


    function enterPress(e) {
        let key = e.which || e.keyCode;
        if (key == 13) {
            startSearch();
        }
    }


    function startSearch() {
        console.log("start search");
        searchString = document.getElementById("search-input");
        if (!searchString.value) {
            alert("Please enter a proper search!");
            searchString.focus();
            return;
        }
       

        getSearchResults();


    }

    function getSearchResults() {

        let url = `${movieDataBaseURL}search/movie?api_key=${APIKEY}&query=${searchString.value}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data);

                //  create the page from data
                createPage(data);

                //  navigate to "results";
            })
            .catch(error => console.log(error));
    }


   

    function createPage(data) {
        let content = document.querySelector("#search-results>.content");
        let title = document.querySelector("#search-results>.title");

        let message = document.createElement("h1");
        let message2 = document.createElement("h1");
        content.innerHTML = "";
        title.innerHTML = "";



        if (data.total_results == 0) {
            message.innerHTML = `No Results found for ${searchString.value}: `;
        } else {
            message.innerHTML = `${data.total_results} total results for "${searchString.value}": `;
            message2.innerHTML = "Click on a movie card to get recommendations!";

        }
        title.appendChild(message);
        title.appendChild(message2);

        message.style.cssText = "margin: 1rem; text-decoration:underline; color:darkgreen;"
        message2.style.cssText = "margin: 1rem; text-decoration:underline; color:darkgreen;"


        let documentFragment = new DocumentFragment();

        documentFragment.appendChild(createMovieCards(data.results));

        content.appendChild(documentFragment);

        let cardList = document.querySelectorAll(".content>div");

        cardList.forEach(function (item) {
            item.addEventListener("click", pageSwitch);
            item.addEventListener("click", getRecommendations);

        });

    }


    function createRecPage(data) {
        let content = document.querySelector("#recommend-results>.content");
        let title = document.querySelector("#recommend-results>.title");

        let message = document.createElement("h1");
        let message2 = document.createElement("h1");

        content.innerHTML = "";
        title.innerHTML = "";


        if (data.total_results == 0) {
            message.innerHTML = `No Results found for ${searchString.value}: `;
        } else {
            message.innerHTML = `${data.total_results} total results for "${searchString.value}": `;
            message2.innerHTML = "Click on a movie card to get recommendations!";
        }

        title.appendChild(message);
        title.appendChild(message2);

        message.style.cssText = "margin: 1rem; text-decoration:underline; color:darkgreen;"
        message2.style.cssText = "margin: 1rem; text-decoration:underline; color:darkgreen;"

        let documentFragment = new DocumentFragment();

        documentFragment.appendChild(createMovieCards(data.results));

        content.appendChild(documentFragment);

        let cardList = document.querySelectorAll(".content>div");

        cardList.forEach(function (item) {
            item.addEventListener("click", getRecommendations);
            item.addEventListener("click", pageSwitch);

        });

    }


    function createMovieCards(results) {
        let documentFragment = new DocumentFragment();

        results.forEach(function (movie) {

            let movieCard = document.createElement("div");
            let section = document.createElement("section");
            let image = document.createElement("img");
            let videoTitle = document.createElement("h1");
            let lang = document.createElement("h4");
            let videoDate = document.createElement("h3");
            let videoRating = document.createElement("h4");
            let voteData = document.createElement("h4");
            let videoOverview = document.createElement("p");



            videoTitle.textContent = movie.title;
            videoDate.textContent = movie.release_date;
            videoRating.textContent = "Vote Average: " + movie.vote_average;
            voteData.textContent = "Vote Count: " + movie.vote_count;
            lang.textContent = "Language: " + movie.original_language;
            videoOverview.textContent = movie.overview;
            
            
         

            videoOverview.style.margin = "10px 0 10px 0";

            videoTitle.style.textDecoration = "underline";

            videoTitle.style.color = "darkgreen";

            image.src = `${imageURL}${imageSizes[2]}${movie.poster_path}`;

            movieCard.setAttribute("data-title", movie.title);
            movieCard.setAttribute("data-id", movie.id);

            //class names
            movieCard.className = "movieCard";
            section.className = "imageSection";

            // append elements
            section.appendChild(image);
            movieCard.appendChild(section);
            movieCard.appendChild(videoTitle);
            movieCard.appendChild(videoDate);
            movieCard.appendChild(lang);
            movieCard.appendChild(videoRating);
            movieCard.appendChild(voteData);
            movieCard.appendChild(videoOverview);



            documentFragment.appendChild(movieCard);



        });

        return documentFragment;
    }



    function getRecommendations() {


        console.log(this);
        let movieTitle = this.getAttribute("data-title");
        let movieID = this.getAttribute("data-id");

        //changes searchbar string
        searchString.value = movieTitle;

        console.log("you clicked: " + movieTitle + " " + movieID);


        let url = `${movieDataBaseURL}movie/${movieID}/recommendations?api_key=${APIKEY}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data);

                createRecPage(data);
            })
            .catch(error => console.log(error));


    }



    function pageSwitch() {

        let resultsPage = document.getElementById("search-results");
        let recommendPage = document.getElementById("recommend-results");

        if (resultsPage.className.indexOf("active") == -1) {

            resultsPage.classList.add("active");
            recommendPage.classList.remove("active");

        } else if (recommendPage.className.indexOf("active") == -1) {

            recommendPage.classList.add("active");
            resultsPage.classList.remove("active");
        }
    }


    function goBack() {
        let back = document.querySelector(".backButtonDiv");
        back.addEventListener("click", function () {

            document.getElementById("recommend-results").classList.remove("active");
            document.getElementById("search-results").classList.remove("active");
            document.getElementById("search-input").value = null;


        });
    }
    
    


})();
