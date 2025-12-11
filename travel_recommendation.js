document.addEventListener('DOMContentLoaded', () => {
    
    const mainLandingView = document.getElementById('main-landing-view'); 
    const aboutSection = document.getElementById('about');
    const contactSection = document.getElementById('contact');
    
    const searchContainerNav = document.getElementById('search-container-main');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('recommendation-results');
    const searchButton = document.getElementById('search-button');
    const resetButton = document.getElementById('reset-button');
    
    const KEYWORD_MAP = {
        'beach': 'beaches', 'beaches': 'beaches',
        'temple': 'temples', 'temples': 'temples',
        'country': 'countries', 'countries': 'countries',
        'australia': 'countries', 'japan': 'countries', 'brazil': 'countries'
    };

    window.showSection = function(id) {
        
        mainLandingView.style.display = 'none';
        aboutSection.style.display = 'none';
        contactSection.style.display = 'none';

        if (id === 'home') {
            mainLandingView.style.display = 'block';
            searchContainerNav.style.display = 'flex';
            resultsContainer.style.display = 'flex'; 
        } else if (id === 'about') {
            aboutSection.style.display = 'flex';
            searchContainerNav.style.display = 'none'; 
        } else if (id === 'contact') {
            contactSection.style.display = 'flex';
            searchContainerNav.style.display = 'none';
        }
    }
    
    showSection('home');
    
    async function fetchRecommendations() {
        try {
            const response = await fetch('travel_recommendation_api.json'); 
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const data = await response.json();
            console.log("✅ Data fetched (Task 6 complete)."); 
            return data;
        } catch (error) {
            console.error("❌ Error fetching data:", error);
            resultsContainer.innerHTML = '<p class="error search-prompt">Failed to load travel recommendations.</p>';
            return null;
        }
    }

    function displayResults(results) {
        resultsContainer.innerHTML = '';

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results search-prompt">No recommendations found. Try "beach", "temple", or "country".</p>';
            return;
        }

        results.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('recommendation-card');
            
            const timeDisplay = item.time 
                ? `<p class="country-time">Current Time: <strong>${item.time}</strong></p>` 
                : '';
                
            card.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <h3>${item.name}</h3>
                ${timeDisplay}
                <p>${item.description}</p>
                <button class="details-button cta-button">Visit</button>
            `;
            resultsContainer.appendChild(card);
        });
    }

    async function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            resultsContainer.innerHTML = '<p class="search-prompt">Please enter a valid search query.</p>';
            return;
        }

        const allData = await fetchRecommendations();
        if (!allData) return;

        let foundResults = [];
        const searchKey = KEYWORD_MAP[searchTerm];

        if (searchKey === 'countries') {
            const matchedCountry = allData.countries.find(c => c.name.toLowerCase() === searchTerm);
            
            if (matchedCountry) {
                foundResults = matchedCountry.cities.slice(0, 2).map(city => ({
                    ...city,
                    timeZone: matchedCountry.timeZone
                }));
            } else if (searchTerm === 'country' || searchTerm === 'countries') {
                if (allData.countries.length > 0) {
                    foundResults = allData.countries[0].cities.slice(0, 2).map(city => ({
                        ...city,
                        timeZone: allData.countries[0].timeZone
                    }));
                }
            }
        } else if (searchKey && allData[searchKey]) {
            foundResults = allData[searchKey].slice(0, 2); 
        } 
        
        foundResults = foundResults.map(item => {
            if (item.timeZone) {
                const options = { timeZone: item.timeZone, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
                item.time = new Date().toLocaleTimeString('en-US', options);
            }
            return item;
        });

        displayResults(foundResults);
    }

    function handleReset() {
        searchInput.value = '';
        resultsContainer.innerHTML = '<p class="search-prompt">Search results cleared. Ready for a new query!</p>';
        console.log("Search results cleared (Task 9 complete).");
    }

    searchButton.addEventListener('click', handleSearch);
    resetButton.addEventListener('click', handleReset);
});