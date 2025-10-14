document.addEventListener("DOMContentLoaded", async () => {
  const carsContainer = document.querySelector(".row.g-4");

  try {
    const response = await fetch("/cars"); // Spring Boot endpoint
    const cars = await response.json();

    carsContainer.innerHTML = ""; // clear placeholders (just in case)

    cars.forEach((car) => {
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
                <div class="price-info-simple">
                    <div class="price-display">
                        <span class="price-per-day-large">${car.price} kr / dag</span>
                    </div>
                    <a href="#" class="btn-book-now">Välj datum & Boka</a>
                </div>
            </div>
        </div>
    </div>
`;

      carsContainer.appendChild(carCard);
    });
  } catch (error) {
    console.error("❌ Failed to load cars:", error);
    carsContainer.innerHTML = "<p>Could not load cars right now.</p>";
  }
});
