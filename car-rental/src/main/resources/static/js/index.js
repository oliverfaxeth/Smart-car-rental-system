// Gör handleBooking global så den kan anropas från HTML
function handleBooking(carId, startDate, endDate) {
  const token = sessionStorage.getItem("jwtToken");

  if (!token) {
    // Spara bokningsinformation i sessionStorage innan redirect
    sessionStorage.setItem(
      "pendingBooking",
      JSON.stringify({
        carId: carId,
        startDate: startDate,
        endDate: endDate,
      })
    );

    alert("Du måste logga in för att boka");
    window.location.href = "/login.html";
    return false;
  }

  // Hämta bilinformation från sessionStorage först, annars window
  const storedCars =
    JSON.parse(sessionStorage.getItem("availableCars")) ||
    window.availableCars ||
    [];
  const car = storedCars.find((c) => c.id == carId);

  if (!car) {
    alert("Bilen kunde inte hittas.");
    return false;
  }

  // Skapa pendingBooking och spara
  const pendingBooking = {
    car: car,
    startDate: startDate,
    endDate: endDate,
  };
  sessionStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));

  // Navigera till bokningssidan
  window.location.href = "/booking-confirmation.html";
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // Carousel och bilrendering
  // ===============================
  async function initializeCarousel() {
    console.log("Initierar carousel med data från databas...");
    try {
      const startDate = sessionStorage.getItem("startDate");
      const endDate = sessionStorage.getItem("endDate");
      let cars;

      if (startDate && endDate) {
        const response = await fetch(
          `http://localhost:8080/cars/available?startDate=${startDate}&endDate=${endDate}&sort=asc`
        );
        if (!response.ok) throw new Error("Kunde inte hämta bilar");
        cars = await response.json();
      } else {
        const response = await fetch(`http://localhost:8080/cars/active`);  //Visa bara aktiva bilar
        if (!response.ok) throw new Error("Kunde inte hämta bilar");
        cars = await response.json();
      }

      window.availableCars = cars;
      sessionStorage.setItem("availableCars", JSON.stringify(cars));
      renderCarousel(cars);
      initializeCarouselNavigation();
    } catch (error) {
      console.error("Fel vid initiering av carousel:", error);
    }
  }

  function initializeCarouselNavigation() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const carouselTrack = document.getElementById("carouselTrack");

    if (!prevBtn || !nextBtn || !carouselTrack) return;

    prevBtn.addEventListener("click", () => {
      carouselTrack.scrollBy({ left: -400, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      carouselTrack.scrollBy({ left: 400, behavior: "smooth" });
    });
  }

  initializeCarousel();

  // ===============================
  // Sökruta och datumhantering
  // ===============================
  const searchForm = document.getElementById("searchForm");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const gridView = document.getElementById("gridView");
  const carouselView = document.getElementById("carouselView");
  const filterBar = document.getElementById("filterBar");
  const noResultsMessage = document.getElementById("noResults");
  const gridContainer = document.getElementById("gridContainer");
  const sortSelect = document.getElementById("sortSelect");

  // Ladda sparade datum
  if (sessionStorage.getItem("startDate"))
    startDateInput.value = sessionStorage.getItem("startDate");
  if (sessionStorage.getItem("endDate"))
    endDateInput.value = sessionStorage.getItem("endDate");

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!startDate || !endDate) {
      alert("Både start- och slutdatum måste väljas");
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    if (startDateObj < todayObj) {
      alert("Startdatum kan inte vara tidigare än dagens datum");
      return;
    }
    if (endDateObj <= startDateObj) {
      alert("Slutdatum måste vara minst 1 dag efter startdatum");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/cars/available?startDate=${startDate}&endDate=${endDate}&sort=${sortSelect.value}`
      );
      if (!response.ok) throw new Error("Kunde inte hämta bilar");
      const availableCars = await response.json();
      window.availableCars = availableCars;
      sessionStorage.setItem("availableCars", JSON.stringify(availableCars));
      sessionStorage.setItem("startDate", startDate);
      sessionStorage.setItem("endDate", endDate);
      renderSearchResults(availableCars, startDate, endDate, sortSelect.value);

      // 🎯 UX FÖRBÄTTRING: Automatisk scroll till resultaten
      setTimeout(() => {
        const filterBar = document.getElementById('filterBar');
        if (filterBar) {
          // Scroll till filter-bar som är precis efter subtitle
          filterBar.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 150); // Liten delay för att säkerställa rendering är klar
      
    } catch (error) {
      console.error("Fel vid sökning:", error);
      alert("Ett fel inträffade vid sökning av bilar. Försök igen.");
    }
  });

  function renderSearchResults(
    results,
    startDate,
    endDate,
    initialSortOrder = "price-asc"
  ) {
    carouselView.classList.add("hidden");
    gridView.classList.add("active");
    filterBar.classList.add("active");

    if (results.length === 0) {
      noResultsMessage.classList.add("active");
      document.getElementById(
        "resultsCount"
      ).innerHTML = `Inga bilar tillgängliga`;
      gridContainer.innerHTML = "";
      return;
    }

    noResultsMessage.classList.remove("active");
    document.getElementById("resultsCount").innerHTML = `Visar <strong>${
      results.length
    } bilar</strong> för <strong>${calculateDays(
      startDate,
      endDate
    )} dagar</strong>`;

    const optionExists = Array.from(sortSelect.options).some(
      (option) => option.value === initialSortOrder
    );
    sortSelect.value = optionExists ? initialSortOrder : "price-asc";

    const sortAndRenderCars = (cars, sortOrder) => {
      let sortedCars =
        sortOrder === "price-desc"
          ? cars.sort((a, b) => b.price - a.price)
          : cars.sort((a, b) => a.price - b.price);
      gridContainer.innerHTML = "";

      sortedCars.forEach((car) => {
        const carCard = document.createElement("div");
        carCard.classList.add("col-md-6", "col-lg-4");
        carCard.innerHTML = `
                    <div class="car-card-grid">
                        <div class="car-img-section">
                            <img src="/images/${car.imageUrl}" alt="${
          car.brand
        } ${car.model}" class="img-fluid">
                        </div>
                        <div class="car-info">
                            <div class="car-header"><h3>${car.brand} ${
          car.model
        }</h3></div>
                            <div class="car-meta">
                                <span class="badge">${car.category.name}</span>
                                <i class="bi bi-calendar3"></i> ${car.year}
                            </div>
                            <div class="car-specs">
                                <span class="car-spec-item"><i class="bi bi-fuel-pump"></i> ${
                                  car.fuel
                                }</span>
                                <span class="car-spec-item"><i class="bi bi-gear"></i> ${
                                  car.transmission
                                }</span>
                                <span class="car-spec-item"><i class="bi bi-people"></i> ${
                                  car.seats
                                } sits</span>
                            </div>
                            <div class="car-footer">
                                <div class="price-info">
                                    <div class="price-left">
                                        <span class="small-text">Totalt ${calculateDays(
                                          startDate,
                                          endDate
                                        )} dagar</span>
                                        <span class="price-large">${calculateTotalPrice(
                                          car.price,
                                          startDate,
                                          endDate
                                        )} kr</span>
                                    </div>
                                    <div class="price-right">
                                        <button class="btn-book-now" data-car-id="${
                                          car.id
                                        }">Boka nu</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        gridContainer.appendChild(carCard);
      });

      document.querySelectorAll(".btn-book-now").forEach((btn) => {
        btn.addEventListener("click", () => {
          const carId = btn.dataset.carId;
          handleBooking(carId, startDate, endDate);
        });
      });
    };

    sortSelect.addEventListener("change", () => {
      sortAndRenderCars(results, sortSelect.value);
    });

    sortAndRenderCars(results, initialSortOrder);
  }

});

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function calculateTotalPrice(dailyPrice, startDate, endDate) {
  const days = calculateDays(startDate, endDate);
  return (dailyPrice * days).toFixed(2);
}

// ===============================
// Hämta customer från backend via JWT
// ===============================
async function getCurrentCustomer() {
  const token = sessionStorage.getItem("jwtToken");
  if (!token) return null;


  try {
    const res = await fetch("http://localhost:8080/customers/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Kunde inte hämta kund");

    const customer = await res.json();
    sessionStorage.setItem("currentCustomer", JSON.stringify(customer));
    console.log(customer);
    return customer;
} catch (err) {
    console.error("Fel vid hämtning av kund:", err);
    return null;
}
}

// ===============================
// Bokningssidan - visa sammanfattning och skapa bokning
// ===============================
async function bookingConfirmation() {
  const bookingContainer = document.getElementById("bookingContainer");
  if (!bookingContainer) return;

  const pendingBooking = JSON.parse(sessionStorage.getItem("pendingBooking"));
  if (!pendingBooking) {
    alert("Ingen bokning hittades.");
    window.location.href = "/index.html";
    return;
  }



  const customer = await getCurrentCustomer();
  if (!customer) {
    alert("Du måste logga in för att slutföra bokning.");
    window.location.href = "/login.html";
    return;
  }

  const { car, startDate, endDate } = pendingBooking;

  console.log("Customer: ", customer);

  console.log("Pending booking:", pendingBooking);

  const bookingSummary = {...pendingBooking, customer};

  console.log("Här är summary:" , bookingSummary);

  bookingContainer.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h3>Bokningssammanfattning</h3>
                    </div>
                    <div class="card-body">
                        <h5>${car.brand} ${car.model} (${car.year})</h5>
                        <p>Kategori: ${car.category.name}</p>
                        <p>Datum: ${startDate} → ${endDate} (${calculateDays(
    startDate,
    endDate
  )} dagar)</p>
                        <p>Pris/dag: ${car.price} kr</p>
                        <p>Totalpris: ${calculateTotalPrice(
                          car.price,
                          startDate,
                          endDate
                        )} kr</p>
                        <hr>
                        <h6>Dina uppgifter</h6>
                        <p>${customer.firstName} ${customer.lastName}</p>
                        <p>${customer.email}</p>
                        <div class="form-check mt-3">
                            <input class="form-check-input" type="checkbox" id="agreeTerms">
                            <label class="form-check-label" for="agreeTerms">
                                Jag godkänner bokningsvillkoren
                            </label>
                        </div>
                        <button id="confirmBookingBtn" class="btn btn-success mt-3" disabled>Slutför bokning</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  const agreeCheckbox = document.getElementById("agreeTerms");
  const confirmBtn = document.getElementById("confirmBookingBtn");

  agreeCheckbox.addEventListener("change", () => {
    confirmBtn.disabled = !agreeCheckbox.checked;
  });

  confirmBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("http://localhost:8080/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwtToken") || ""}`,
        },
        body: JSON.stringify({
          carId: car.id,
          customerId: customer.id,
          startDate,
          endDate,
          paymentMethod: "Cash",
        }),
      });

      if (!response.ok) throw new Error("Kunde inte skapa bokning");

      const booking = await response.json();
      alert(`Bokning bekräftad! Ditt bokningsnummer: ${booking.bookingNumber}`);
      sessionStorage.removeItem("pendingBooking");
      window.location.href = "/index.html";
    } catch (err) {
      console.error("Fel vid bokning:", err);
      alert("Ett fel uppstod vid bokning. Försök igen.");
    }
  });
}

// Måste vara längst ner för att ladda in efter DOM har skapat elementet
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("bookingContainer")) {
    bookingConfirmation();
  }
});