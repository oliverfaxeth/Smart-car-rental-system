document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const gridView = document.getElementById("gridView");
    const carouselView = document.getElementById("carouselView");
    const filterBar = document.getElementById("filterBar");
    const noResultsMessage = document.getElementById("noResults");
    const gridContainer = document.getElementById("gridContainer");

    // Funktioner för att hantera sökresultat med sessionStorage
    function saveSearchResults(results, startDate, endDate, sort) {
        console.log('Saving search results:', { 
                resultsLength: results.length, 
                startDate, 
                endDate, 
                sort 
            });

        sessionStorage.setItem('searchResults', JSON.stringify(results));
        sessionStorage.setItem('startDate', startDate);
        sessionStorage.setItem('endDate', endDate);
        sessionStorage.setItem('sortOrder', sort);
    }

    function loadSearchResults() {
        const results = sessionStorage.getItem('searchResults');
        const startDate = sessionStorage.getItem('startDate');
        const endDate = sessionStorage.getItem('endDate');
        const sortOrder = sessionStorage.getItem('sortOrder') || 'price-asc';


        console.log('Loading search results:', { 
        resultsExists: !!results, 
        startDate, 
        endDate, 
        sortOrder 
    });

        return { 
            results: results ? JSON.parse(results) : null, 
            startDate, 
            endDate,
            sortOrder 
        };
    }

    function clearSearchResults() {
        sessionStorage.removeItem('searchResults');
        sessionStorage.removeItem('startDate');
        sessionStorage.removeItem('endDate');
    }

    // Funktion för att rendera sökresultat
    function renderSearchResults(results, startDate, endDate, initialSortOrder = 'price-asc') {
        
    // Dölj carousel, visa grid och filterbar
    carouselView.classList.add('hidden');
    gridView.classList.add('active');
    filterBar.classList.add('active');

    // Hantera fall med inga resultat
    if (results.length === 0) {
        noResultsMessage.classList.add('active');
        document.getElementById("resultsCount").innerHTML = `Inga bilar tillgängliga`;
        gridContainer.innerHTML = "";
        return;
    }

    // Dölj "inga resultat"-meddelande
    noResultsMessage.classList.remove('active');
    document.getElementById("resultsCount").innerHTML = 
    `Visar <strong>${results.length} bilar</strong> för <strong>${calculateDays(startDate, endDate)} dagar</strong>`;

    const sortSelect = document.getElementById("sortSelect");
    
    console.log('Current sortSelect options:', 
        Array.from(sortSelect.options).map(option => option.value)
    );
    console.log('Attempting to set sort to:', initialSortOrder);
    
    // Kontrollera att värdet finns i select-elementet
    const optionExists = Array.from(sortSelect.options)
        .some(option => option.value === initialSortOrder);
    
    if (optionExists) {
        sortSelect.value = initialSortOrder;
        console.log('Sort value set successfully');
    } else {
        console.warn('Sort value not found in options, defaulting to price-asc');
        sortSelect.value = 'price-asc';
    }
    
    // Funktion för att sortera och rendera bilar
    const sortAndRenderCars = (cars, sortOrder) => {
        let sortedCars;
        if (sortOrder === "price-desc") {
            sortedCars = cars.sort((a, b) => b.price - a.price);
        } else {
            // default är "price-asc"
            sortedCars = cars.sort((a, b) => a.price - b.price);
        }

        // Rensa tidigare resultat
        gridContainer.innerHTML = "";

        // Rendera sorterade bilar
        sortedCars.forEach((car) => {
            const carCard = document.createElement("div");
            carCard.classList.add("col-md-6", "col-lg-4");
            carCard.innerHTML = `
            <div class="car-card-grid">
                <div class="car-img-section">
                    <img src="/images/${car.imageUrl}" alt="${car.brand} ${car.model}" class="img-fluid">
                </div>
                <div class="car-info">
                    <div class="car-header"><h3>${car.brand} ${car.model}</h3></div>
                    <div class="car-meta">
                        <span class="badge">${car.category.name}</span>
                        <i class="bi bi-calendar3"></i> ${car.year}
                    </div>
                    <div class="car-specs">
                        <span class="car-spec-item"><i class="bi bi-fuel-pump"></i> ${car.fuel}</span>
                        <span class="car-spec-item"><i class="bi bi-gear"></i> ${car.transmission}</span>
                        <span class="car-spec-item"><i class="bi bi-people"></i> ${car.seats} sits</span>
                    </div>
                    <div class="car-footer">
                        <div class="price-info">
                            <div class="price-left">
                                <span class="small-text">Totalt ${calculateDays(startDate, endDate)} dagar</span>
                                <span class="price-large">${calculateTotalPrice(car.price, startDate, endDate)} kr</span>
                            </div>
                        
                            <div class="price-right">
                            <a href="#" class="btn-book-now" onclick="handleBooking(${car.id}, '${startDate}', '${endDate}')">
                                Boka nu
                            </a>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
            `;
            gridContainer.appendChild(carCard);
        });
    };

    // Lägg till event listener för sortering
    sortSelect.addEventListener('change', () => {
        sortAndRenderCars(results, sortSelect.value);
    });

    // Initial rendering med standard sortering
    sortAndRenderCars(results, initialSortOrder);

    // Uppdatera sorteringsknappen baserat på sparad ordning
    sortSelect.value = initialSortOrder;


    // results.forEach((car) => {
    //     const carCard = document.createElement("div");
    //     carCard.classList.add("col-md-6", "col-lg-4");
    //     carCard.innerHTML = `
    //     <div class="car-card-grid">
    //         <div class="car-img-section">
    //             <img src="/images/${car.imageUrl}" alt="${car.brand} ${car.model}" class="img-fluid">
    //         </div>
    //         <div class="car-info">
    //             <!-- Befintlig bilkortsinformation -->
    //             <div class="car-footer">
    //                 <div class="price-info">
    //                     <div class="price-left">
    //                         <span class="small-text">Totalt ${calculateDays(startDate, endDate)} dagar</span>
    //                         <span class="price-large">${calculateTotalPrice(car.price, startDate, endDate)} kr</span>
    //                     </div>
    //                     <div class="price-right">
    //                         <a href="#" class="btn-book-now" onclick="handleBooking(${car.id}, '${startDate}', '${endDate}')">
    //                             Boka
    //                         </a>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    //     `;
    //     gridContainer.appendChild(carCard);
    // });


    }

    // Kontrollera om det finns sparade sökresultat när sidan laddas
    const savedResults = loadSearchResults();
    if (savedResults.results) {
        console.log('Rendering saved results with sort:', savedResults.sortOrder);

        renderSearchResults(savedResults.results, savedResults.startDate, savedResults.endDate, savedResults.sortOrder);
        
        // Fyll i datumfälten med sparade datum
        startDateInput.value = savedResults.startDate;
        endDateInput.value = savedResults.endDate;
    }

    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        // Validering (samma som tidigare)
        if (!startDate || !endDate) {
            alert("Både start- och slutdatum måste väljas");
            return;
        }

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const todayObj = new Date();

        if (startDateObj < todayObj) {
            alert("Startdatum kan inte vara tidigare än dagens datum");
            return;
        }

        if (endDateObj <= startDateObj) {
            alert("Slutdatum måste vara minst 1 dag efter startdatum");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/cars/available?startDate=${startDate}&endDate=${endDate}&sort=${sortSelect.value}`);
            
            if (!response.ok) {
                throw new Error('Kunde inte hämta bilar');
            }

            const availableCars = await response.json();

            // Spara och rendera sökresultat
            saveSearchResults(availableCars, startDate, endDate, sortSelect.value);
            renderSearchResults(availableCars, startDate, endDate, sortSelect.value);

        } catch (error) {
            console.error("Fel vid sökning:", error);
            alert("Ett fel inträffade vid sökning av bilar. Försök igen.");
        }
    });

    // Funktion för att hantera bokning
    function handleBooking(carId, startDate, endDate) {
    // Kontrollera om användaren är inloggad
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    
    if (!token) {
        // Spara bokningsinformation i sessionStorage
        sessionStorage.setItem('pendingBooking', JSON.stringify({
            carId: carId,
            startDate: startDate,
            endDate: endDate
        }));

        // Visa meddelande och redirecta till login
        alert('Du måste logga in för att boka');
        window.location.href = '/login.html';
        return;
    }

    // Fortsätt med normal bokningsprocess om inloggad
    return true;
}

    // Hjälpfunktioner
    function calculateDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    function calculateTotalPrice(dailyPrice, startDate, endDate) {
        const days = calculateDays(startDate, endDate);
        return (dailyPrice * days).toFixed(2);
    }
});