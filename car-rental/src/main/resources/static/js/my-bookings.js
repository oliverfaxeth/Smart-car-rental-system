// my-bookings.js - JavaScript för att hantera "Mina Bokningar" sidan
// Hämtar bokningar från backend och möjliggör avbokningar

// API endpoints
const API_BASE_URL = 'http://localhost:8080';

// DOM element referenser
let currentUserId = null;

// Initialisera sidan när DOM är redo
document.addEventListener('DOMContentLoaded', function() {
    // Kontrollera autentisering först
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Hämta användar-ID från localStorage/sessionStorage
    currentUserId = getUserId();
    
    if (!currentUserId) {
        console.error('Kunde inte hämta användar-ID');
        showError('Ett fel uppstod. Vänligen logga in igen.');
        return;
    }

    // Ladda bokningar
    loadBookings();
});

// Funktion för att växla mellan pågående och historik
function showBookings(type) {
    const ongoingBtn = document.getElementById('btnOngoing');
    const historyBtn = document.getElementById('btnHistory');
    const ongoingList = document.getElementById('ongoingBookings');
    const historyList = document.getElementById('historyBookings');
    
    if (type === 'ongoing') {
        ongoingBtn.classList.add('active');
        historyBtn.classList.remove('active');
        ongoingList.classList.add('active');
        historyList.classList.remove('active');
    } else {
        historyBtn.classList.add('active');
        ongoingBtn.classList.remove('active');
        historyList.classList.add('active');
        ongoingList.classList.remove('active');
    }
}

// Ladda alla bokningar för inloggad användare
async function loadBookings() {
    try {
        showLoadingState();
        
        const response = await fetch(`${API_BASE_URL}/rentals/customer/${currentUserId}`, {
            method: 'GET',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const bookings = await response.json();
        console.log('Loaded bookings:', bookings);
        
        // Separera pågående och historiska bokningar
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Sätt tid till 00:00 för korrekt jämförelse
        
        const ongoingBookings = bookings.filter(booking => {
            const endDate = new Date(booking.endDate);
            return endDate >= today && booking.status === 'ACTIVE';
        });
        
        const historyBookings = bookings.filter(booking => {
            const endDate = new Date(booking.endDate);
            return endDate < today || booking.status !== 'ACTIVE';
        });

        // Rendera bokningarna
        renderOngoingBookings(ongoingBookings);
        renderHistoryBookings(historyBookings);
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        hideLoadingState();
        showError('Kunde inte ladda dina bokningar. Vänligen försök igen.');
    }
}

// Rendera pågående bokningar
function renderOngoingBookings(bookings) {
    const container = document.getElementById('ongoingBookings');
    const emptyState = document.getElementById('emptyOngoing');
    
    // Hitta befintlig innehåll (header) och behåll det
    const header = container.querySelector('h3');
    
    // Rensa allt utom headern
    container.innerHTML = '';
    if (header) {
        container.appendChild(header);
    }
    
    if (bookings.length === 0) {
        emptyState.style.display = 'block';
        container.appendChild(emptyState);
        return;
    }
    
    emptyState.style.display = 'none';
    
    bookings.forEach(booking => {
        const bookingCard = createBookingCard(booking, true);
        container.appendChild(bookingCard);
    });
}

// Rendera historiska bokningar
function renderHistoryBookings(bookings) {
    const container = document.getElementById('historyBookings');
    const emptyState = document.getElementById('emptyHistory');
    
    // Hitta befintlig innehåll (header) och behåll det
    const header = container.querySelector('h3');
    
    // Rensa allt utom headern
    container.innerHTML = '';
    if (header) {
        container.appendChild(header);
    }
    
    if (bookings.length === 0) {
        emptyState.style.display = 'block';
        container.appendChild(emptyState);
        return;
    }
    
    emptyState.style.display = 'none';
    
    bookings.forEach(booking => {
        const bookingCard = createBookingCard(booking, false);
        container.appendChild(bookingCard);
    });
}

// Skapa en booking card
function createBookingCard(booking, isOngoing) {
    const card = document.createElement('div');
    card.className = 'booking-card';
    
    // Beräkna antal dagar
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const dayDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Formatera datum till svenska format
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('sv-SE');
    };
    
    // Bestäm status och dess display
    const getStatusInfo = (status) => {
        switch (status) {
            case 'ACTIVE':
                return { class: 'confirmed', text: 'Bekräftad' };
            case 'CANCELLED':
                return { class: 'cancelled', text: 'Avbokad' };
            case 'COMPLETED':
                return { class: 'completed', text: 'Slutförd' };
            default:
                return { class: 'pending', text: 'Väntar' };
        }
    };
    
    const statusInfo = getStatusInfo(booking.status);
    
    card.innerHTML = `
        <div class="booking-card-header">
            <div class="booking-id">Bokning #${booking.id}</div>
            <div class="booking-status ${statusInfo.class}">${statusInfo.text}</div>
        </div>
        
        <div class="car-info-section">
            <div class="car-info-header">
                <i class="bi bi-car-front"></i>
                <h4>${booking.car.brand} ${booking.car.model}</h4>
            </div>
            <div class="car-details-grid">
                <div class="booking-detail-item">
                    <span class="booking-detail-label">Registreringsnummer</span>
                    <span class="booking-detail-value">${booking.car.regNr}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="booking-detail-label">Modell</span>
                    <span class="booking-detail-value">${booking.car.year}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="booking-detail-label">Bränsle</span>
                    <span class="booking-detail-value">${booking.car.fuel}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="booking-detail-label">Växellåda</span>
                    <span class="booking-detail-value">${booking.car.transmission}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="booking-detail-label">Platser</span>
                    <span class="booking-detail-value">${booking.car.seats} personer</span>
                </div>
            </div>
        </div>
        
        <div class="booking-details">
            <div class="booking-detail-item">
                <span class="booking-detail-label">Från datum</span>
                <span class="booking-detail-value">${formatDate(booking.startDate)}</span>
            </div>
            <div class="booking-detail-item">
                <span class="booking-detail-label">Till datum</span>
                <span class="booking-detail-value">${formatDate(booking.endDate)}</span>
            </div>
            <div class="booking-detail-item">
                <span class="booking-detail-label">Antal dagar</span>
                <span class="booking-detail-value">${dayDifference} dagar</span>
            </div>
            <div class="booking-detail-item">
                <span class="booking-detail-label">${booking.status === 'CANCELLED' ? 'Avbokningsdatum' : 'Totalt pris'}</span>
                <span class="booking-detail-value ${booking.status !== 'CANCELLED' ? 'highlight' : ''}">${
                    booking.status === 'CANCELLED' 
                        ? formatDate(booking.rentalDate) 
                        : formatPrice(booking.payment.amount) + ' kr'
                }</span>
            </div>
        </div>
        
        ${isOngoing && booking.status === 'ACTIVE' ? `
            <div class="booking-actions">
                <button class="btn-booking-action btn-cancel" onclick="cancelBooking(${booking.id})">
                    <i class="bi bi-x-circle"></i> Avboka
                </button>
            </div>
        ` : ''}
    `;
    
    return card;
}

// Formatera pris
function formatPrice(amount) {
    return new Intl.NumberFormat('sv-SE').format(amount);
}

// Avboka en bokning
async function cancelBooking(bookingId) {
    // Bekräfta avbokning
    if (!confirm('Är du säker på att du vill avboka denna bokning?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/rentals/${bookingId}/cancel`, {
            method: 'PUT',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
        
        const message = await response.text();
        showSuccess(message);
        
        // Ladda om bokningarna för att visa uppdaterad status
        loadBookings();
        
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showError(error.message || 'Kunde inte avboka bokningen. Vänligen försök igen.');
    }
}

// Visa laddningsstate
function showLoadingState() {
    const container = document.querySelector('.bookings-container');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Laddar...</span>
                </div>
                <p class="mt-3">Laddar dina bokningar...</p>
            </div>
        `;
    }
}

// Dölj laddningsstate (genom att ladda om bokningar)
function hideLoadingState() {
    // Denna funktion kallas efter att bokningarna har renderats
}

// Visa felmeddelande
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        
        // Ta bort alert efter 5 sekunder
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Visa framgångsmeddelande
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        
        // Ta bort alert efter 5 sekunder
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Funktion för utloggning
function logout() {
    if (confirm('Är du säker på att du vill logga ut?')) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        
        sessionStorage.removeItem('jwtToken');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('firstName');
        sessionStorage.removeItem('lastName');
        
        window.location.href = 'login.html';
    }
}