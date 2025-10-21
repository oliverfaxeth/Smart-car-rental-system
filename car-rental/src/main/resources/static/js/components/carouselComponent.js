// carouselComponent.js - Ansvarar för att skapa HTML för carousel-bilar

/**
 * Skapar HTML för ett enskilt bilkort i carousel
 * Tar emot ett car-objekt från databasen och returnerar färdig HTML
 */
function createCarouselCard(car) {
    // Bestäm kategorinamn baserat på bilens kategori-ID
    // Detta matchar de kategorier som finns i din databas
    const categoryName = getCategoryName(car.category.id);
    
    // Bygg upp HTML-strukturen för bilkortet
    // Vi använder template literals (backticks) för att enkelt blanda HTML och JavaScript
    return `
        <div class="car-card-carousel">
            <div class="car-img-section">
                <div class="image-carousel">
                    ${car.imageUrl ? 
                        `<img src="images/${car.imageUrl}" alt="${car.brand} ${car.model}" style="width: 100%; height: 320px; object-fit: cover; border-radius: 0;">` 
                        : 
                        `<i class="bi bi-car-front"></i>`
                    }
                </div>
            </div>
            <div class="car-info">
                <div class="car-header">
                    <h3>${car.brand} ${car.model}</h3>
                </div>
                <div class="car-meta">
                    <span class="badge">${categoryName}</span>
                    <i class="bi bi-calendar3"></i> ${car.year}
                </div>
                <div class="car-specs">
                    <span class="car-spec-item">
                        <i class="bi bi-fuel-pump"></i> ${car.fuel}
                    </span>
                    <span class="car-spec-item">
                        <i class="bi bi-gear"></i> ${car.transmission}
                    </span>
                    <span class="car-spec-item">
                        <i class="bi bi-people"></i> ${car.seats} sits
                    </span>
                </div>
                
                <div class="car-footer">
                    <div class="price-info">
                        <div class="price-left">
                            <span class="small-text">Pris per dag</span>
                            <span class="price-large">${car.price} kr</span>
                        </div>
                        <div class="price-right">
                            <div class="availability-badge">
                                <i class="bi bi-check-circle-fill"></i> Tillgänglig
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Hjälpfunktion som konverterar kategori-ID till kategorinamn
 * Baserat på data från din Cars_Category tabell i databasen
 */
function getCategoryName(categoryId) {
    const categories = {
        1: 'Sedan',
        2: 'SUV',
        3: 'Kombi',
        4: 'Sportvagn'
    };
    return categories[categoryId] || 'Bil';
}

/**
 * Renderar alla bilar i carousel
 * Tar emot en array med bilar och sätter in dem i carousel-tracket
 */
function renderCarousel(cars) {
    const carouselTrack = document.getElementById('carouselTrack');
    
    // Om inga bilar finns, visa ett meddelande
    if (!cars || cars.length === 0) {
        carouselTrack.innerHTML = '<p style="text-align: center; padding: 40px;">Inga bilar tillgängliga just nu.</p>';
        return;
    }
    
    // Ta max 6 bilar för carousel (så det inte blir för många)
    const carsToShow = cars.slice(0, 6);
    
    // Skapa HTML för varje bil och sätt ihop dem
    const carouselHTML = carsToShow.map(car => createCarouselCard(car)).join('');
    
    // Sätt in HTML:en i carousel-tracket
    carouselTrack.innerHTML = carouselHTML;
    
    console.log(`Visar ${carsToShow.length} bilar i carousel`);
}