/*
 * SJÄLVSTÄNDIG MY-BOOKINGS.JS
 * 
 * Denna version innehåller all nödvändig funktionalitet direkt i filen
 * för att undvika beroenden på externa script-filer och timing-problem.
 * 
 * Den använder en enkel, direkt approach som läser autentiseringsdata
 * direkt från localStorage/sessionStorage och hanterar alla API-anrop
 * självständigt.
 */

console.log('🚀 Självständig my-bookings.js startar...');

// Konfiguration för API-anrop
const CONFIG = {
    API_BASE_URL: 'http://localhost:8080',
    STORAGE_KEYS: {
        JWT_TOKEN: 'jwtToken',
        USER_ID: 'userId',
        USER_ROLE: 'userRole',
        FIRST_NAME: 'firstName',
        LAST_NAME: 'lastName'
    }
};

// Huvudklass som hanterar alla bokningsrelaterade funktioner
class BookingsManager {
    constructor() {
        this.currentUserId = null;
        this.currentUserName = null;
        this.authToken = null;
        this.isInitialized = false;
    }

    // Initialiserar bokningshanteraren när DOM är redo
    async initialize() {
        console.log('📱 BookingsManager: Startar initialisering...');
        
        try {
            // Hämta autentiseringsdata direkt från webbläsarens lagring
            this.loadAuthenticationData();
            
            // Kontrollera om användaren är autentiserad
            if (!this.isUserAuthenticated()) {
                this.redirectToLogin();
                return;
            }
            
            // Uppdatera användargränssnittet
            this.updateNavigationUI();
            
            // Ladda och visa bokningar
            await this.loadAndDisplayBookings();
            
            this.isInitialized = true;
            console.log('✅ BookingsManager: Initialisering slutförd framgångsrikt');
            
        } catch (error) {
            console.error('❌ BookingsManager: Fel under initialisering:', error);
            this.showErrorMessage('Ett fel uppstod under laddningen. Försök ladda om sidan.');
        }
    }

    // Läser autentiseringsdata direkt från webbläsarens lagring
    loadAuthenticationData() {
        console.log('🔑 BookingsManager: Hämtar autentiseringsdata...');
        
        // Försök hämta från localStorage först, sedan sessionStorage
        this.currentUserId = this.getFromStorage(CONFIG.STORAGE_KEYS.USER_ID);
        this.currentUserName = this.getFromStorage(CONFIG.STORAGE_KEYS.FIRST_NAME);
        this.authToken = this.getFromStorage(CONFIG.STORAGE_KEYS.JWT_TOKEN);
        
        console.log('🆔 Användar-ID:', this.currentUserId);
        console.log('👤 Användarnamn:', this.currentUserName);
        console.log('🎫 Token finns:', !!this.authToken);
        
        // Validera att vi har nödvändig data
        if (this.currentUserId && this.authToken) {
            console.log('✅ Autentiseringsdata hämtad framgångsrikt');
        } else {
            console.log('⚠️ Ofullständig autentiseringsdata');
        }
    }

    // Hjälpfunktion för att hämta värden från localStorage eller sessionStorage
    getFromStorage(key) {
        let value = localStorage.getItem(key);
        if (!value || value === 'null' || value === 'undefined') {
            value = sessionStorage.getItem(key);
        }
        return (value && value !== 'null' && value !== 'undefined') ? value : null;
    }

    // Kontrollerar om användaren är korrekt autentiserad
    isUserAuthenticated() {
        const isAuthenticated = !!(this.currentUserId && this.authToken);
        console.log('🔍 Autentiseringsstatus:', isAuthenticated ? 'Autentiserad' : 'Ej autentiserad');
        return isAuthenticated;
    }

    // Omdirigerar till inloggningssidan om användaren inte är autentiserad
    redirectToLogin() {
        console.log('🔄 Omdirigerar till inloggningssida...');
        alert('Du måste logga in för att se dina bokningar.');
        window.location.href = 'login.html';
    }

    // Uppdaterar navigationsmenyn för att visa användarens namn och utloggningsknapp
    updateNavigationUI() {
        console.log('🎨 Uppdaterar navigations-UI...');
        
        const authButtons = document.getElementById('authButtons');
        if (!authButtons) {
            console.log('⚠️ authButtons element hittas inte');
            return;
        }

        const userName = this.currentUserName || 'Användare';
        
        authButtons.innerHTML = `
            <a href="profile.html" class="btn-profile" style="text-decoration: none;">
                <i class="bi bi-person-circle"></i> ${userName}
            </a>
            <a href="#" id="logoutBtn" class="btn-logout" style="text-decoration: none; margin-left: 10px;">
                <i class="bi bi-box-arrow-right"></i> Logga ut
            </a>
        `;
        
        // Lägg till utloggningsfunktionalitet
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        console.log('✅ Navigations-UI uppdaterat med användarnamn:', userName);
    }

    // Hanterar utloggning genom att rensa all lagrad data
    logout() {
        console.log('🚪 Loggar ut användare...');
        
        // Rensa all data från localStorage
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        
        // Omdirigera till startsidan
        window.location.href = 'index.html';
    }

    // Huvudfunktion för att hämta och visa bokningar
    async loadAndDisplayBookings() {
        console.log('📚 Startar laddning av bokningar...');
        
        try {
            this.showLoadingState();
            
            // Gör API-anrop för att hämta bokningar
            const bookings = await this.fetchBookingsFromAPI();
            
            // Kategorisera bokningarna
            const categorizedBookings = this.categorizeBookings(bookings);
            
            // Rendera bokningarna i användargränssnittet
            this.renderBookings(categorizedBookings);
            
            this.hideLoadingState();
            
        } catch (error) {
            console.error('❌ Fel vid laddning av bokningar:', error);
            this.hideLoadingState();
            this.showErrorMessage(`Kunde inte ladda bokningar: ${error.message}`);
        }
    }

    // Gör API-anrop för att hämta bokningar från servern
    async fetchBookingsFromAPI() {
        const apiUrl = `${CONFIG.API_BASE_URL}/rentals/customer/${this.currentUserId}`;
        console.log('🌐 API-anrop till:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 API-svar status:', response.status);
        
        if (!response.ok) {
            throw new Error(`API-anrop misslyckades med status ${response.status}`);
        }
        
        const bookings = await response.json();
        console.log('📦 Antal bokningar mottagna:', bookings.length);
        console.log('📋 Bokningsdata:', bookings);
        
        return bookings;
    }

    // Kategoriserar bokningar i pågående och historiska
    categorizeBookings(bookings) {
        console.log('📂 Kategoriserar bokningar...');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const ongoing = bookings.filter(booking => {
            const endDate = new Date(booking.endDate);
            return endDate >= today && booking.status === 'ACTIVE';
        });
        
        const history = bookings.filter(booking => {
            const endDate = new Date(booking.endDate);
            return endDate < today || booking.status !== 'ACTIVE';
        });
        
        console.log('📅 Pågående bokningar:', ongoing.length);
        console.log('📚 Historiska bokningar:', history.length);
        
        return { ongoing, history };
    }

    // Renderar bokningar i användargränssnittet
    renderBookings({ ongoing, history }) {
        console.log('🎨 Renderar bokningar i UI...');
        
        this.renderOngoingBookings(ongoing);
        this.renderHistoryBookings(history);
        
        console.log('✅ Alla bokningar renderade');
    }

    // Renderar pågående bokningar
    renderOngoingBookings(bookings) {
        const container = document.getElementById('ongoingBookings');
        const emptyState = document.getElementById('emptyOngoing');
        
        if (!container) {
            console.error('❌ ongoingBookings container hittas inte');
            return;
        }
        
        // Behåll headern men rensa övrigt innehåll
        const header = container.querySelector('h3');
        container.innerHTML = '';
        if (header) {
            container.appendChild(header);
        }
        
        if (bookings.length === 0) {
            console.log('📭 Inga pågående bokningar att visa');
            if (emptyState) {
                emptyState.style.display = 'block';
                container.appendChild(emptyState);
            }
            return;
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        bookings.forEach((booking, index) => {
            console.log(`🚗 Renderar pågående bokning ${index + 1}: ${booking.car.brand} ${booking.car.model}`);
            const bookingElement = this.createBookingElement(booking, true);
            container.appendChild(bookingElement);
        });
    }

    // Renderar historiska bokningar
    renderHistoryBookings(bookings) {
        const container = document.getElementById('historyBookings');
        const emptyState = document.getElementById('emptyHistory');
        
        if (!container) {
            console.error('❌ historyBookings container hittas inte');
            return;
        }
        
        // Behåll headern men rensa övrigt innehåll
        const header = container.querySelector('h3');
        container.innerHTML = '';
        if (header) {
            container.appendChild(header);
        }
        
        if (bookings.length === 0) {
            console.log('📭 Inga historiska bokningar att visa');
            if (emptyState) {
                emptyState.style.display = 'block';
                container.appendChild(emptyState);
            }
            return;
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        bookings.forEach((booking, index) => {
            console.log(`🚗 Renderar historisk bokning ${index + 1}: ${booking.car.brand} ${booking.car.model}`);
            const bookingElement = this.createBookingElement(booking, false);
            container.appendChild(bookingElement);
        });
    }

    // Skapar ett HTML-element för en enskild bokning med förbättrad design
    createBookingElement(booking, canCancel) {
        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'booking-card';
        bookingDiv.style.cssText = `
            border: 1px solid #e0e6ed;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        `;
        
        // Lägg till hover-effekt
        bookingDiv.addEventListener('mouseenter', () => {
            bookingDiv.style.transform = 'translateY(-2px)';
            bookingDiv.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
        });
        
        bookingDiv.addEventListener('mouseleave', () => {
            bookingDiv.style.transform = 'translateY(0)';
            bookingDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        });
        
        // Bestäm status och färg med förbättrade färgscheman
        let statusText, statusColor, statusBg;
        switch (booking.status) {
            case 'ACTIVE':
                statusText = 'AKTIV';
                statusColor = '#ffffff';
                statusBg = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                break;
            case 'CANCELLED':
                statusText = 'AVBOKAD';
                statusColor = '#ffffff';
                statusBg = 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)';
                break;
            default:
                statusText = 'GENOMFÖRD';
                statusColor = '#ffffff';
                statusBg = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
        }
        
        // Kontrollera om bokningen kan avbokas
        const canActuallyCancel = canCancel && 
            booking.status === 'ACTIVE' && 
            new Date(booking.startDate) > new Date();
        
        // Formatera datum med bättre presentation
        const startDate = new Date(booking.startDate).toLocaleDateString('sv-SE');
        const endDate = new Date(booking.endDate).toLocaleDateString('sv-SE');
        
        // Beräkna antalet dagar för bokningen
        const startDateObj = new Date(booking.startDate);
        const endDateObj = new Date(booking.endDate);
        const daysDifference = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
        
        bookingDiv.innerHTML = `
            <!-- Dekorativ accent-linje -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: ${statusBg};
            "></div>
            
            <!-- Huvudrubrik med bil och status -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 4px 0; color: #2c3e50; font-size: 1.4rem; font-weight: 700;">
                        ${booking.car.brand} ${booking.car.model}
                    </h4>
                    <p style="margin: 0; color: #6c757d; font-size: 0.95rem;">
                        <i class="bi bi-card-text" style="margin-right: 6px;"></i>
                        ${booking.car.regNr || 'Registreringsnummer ej tillgängligt'}
                    </p>
                </div>
                <span style="
                    background: ${statusBg}; 
                    color: ${statusColor}; 
                    padding: 8px 16px; 
                    border-radius: 25px; 
                    font-size: 0.85rem; 
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                ">
                    ${statusText}
                </span>
            </div>
            
            <!-- Informationsraster med förbättrad layout -->
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: start;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                    <!-- Period information -->
                    <div style="
                        background: rgba(13, 110, 253, 0.05);
                        border-left: 4px solid #0d6efd;
                        padding: 12px 16px;
                        border-radius: 8px;
                    ">
                        <p style="margin: 0; display: flex; align-items: center; font-weight: 600;">
                            <i class="bi bi-calendar-check" style="margin-right: 10px; color: #0d6efd; font-size: 1.1rem;"></i>
                            <span style="color: #495057;">Hyresperiod</span>
                        </p>
                        <p style="margin: 4px 0 0 24px; color: #2c3e50; font-weight: 700;">
                            ${startDate} → ${endDate}
                        </p>
                        <p style="margin: 2px 0 0 24px; color: #6c757d; font-size: 0.9rem;">
                            ${daysDifference} ${daysDifference === 1 ? 'dag' : 'dagar'}
                        </p>
                    </div>
                    
                    <!-- Bokningsnummer och registreringsnummer -->
                    <div style="
                        background: rgba(111, 66, 193, 0.05);
                        border-left: 4px solid #6f42c1;
                        padding: 12px 16px;
                        border-radius: 8px;
                    ">
                        <p style="margin: 0; display: flex; align-items: center; font-weight: 600;">
                            <i class="bi bi-hash" style="margin-right: 10px; color: #6f42c1; font-size: 1.1rem;"></i>
                            <span style="color: #495057;">Bokningsnummer</span>
                        </p>
                        <p style="margin: 4px 0 0 24px; color: #2c3e50; font-weight: 700;">
                            ${booking.bookingNumber || 'Genereras automatiskt'}
                        </p>
                    </div>
                    
                    <!-- Pris information -->
                    <div style="
                        background: rgba(25, 135, 84, 0.05);
                        border-left: 4px solid #198754;
                        padding: 12px 16px;
                        border-radius: 8px;
                    ">
                        <p style="margin: 0; display: flex; align-items: center; font-weight: 600;">
                            <i class="bi bi-currency-dollar" style="margin-right: 10px; color: #198754; font-size: 1.1rem;"></i>
                            <span style="color: #495057;">Totalpris</span>
                        </p>
                        <p style="margin: 4px 0 0 24px; color: #2c3e50; font-weight: 700; font-size: 1.1rem;">
                            ${booking.payment.amount.toLocaleString('sv-SE')} kr
                        </p>
                        <p style="margin: 2px 0 0 24px; color: #6c757d; font-size: 0.9rem;">
                            ${Math.round(booking.payment.amount / daysDifference).toLocaleString('sv-SE')} kr/dag
                        </p>
                    </div>
                    
                    <!-- Fordonsinformation -->
                    <div style="
                        background: rgba(253, 126, 20, 0.05);
                        border-left: 4px solid #fd7e14;
                        padding: 12px 16px;
                        border-radius: 8px;
                    ">
                        <p style="margin: 0; display: flex; align-items: center; font-weight: 600;">
                            <i class="bi bi-car-front" style="margin-right: 10px; color: #fd7e14; font-size: 1.1rem;"></i>
                            <span style="color: #495057;">Fordonsinformation</span>
                        </p>
                        <p style="margin: 4px 0 0 24px; color: #2c3e50; font-weight: 700;">
                            ${booking.car.category.name} • ${booking.car.year}
                        </p>
                        <p style="margin: 2px 0 0 24px; color: #6c757d; font-size: 0.9rem;">
                            ${booking.car.fuel} • ${booking.car.transmission}
                        </p>
                    </div>
                </div>
                
                <!-- Åtgärdssektion med förbättrad design -->
                <div style="text-align: center; min-width: 140px;">
                    ${canActuallyCancel ? `
                        <button 
                            class="btn btn-danger" 
                            onclick="bookingsManager.cancelBooking(${booking.id})"
                            style="
                                white-space: nowrap;
                                padding: 12px 20px;
                                font-weight: 600;
                                border-radius: 25px;
                                border: none;
                                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                                box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(220, 53, 69, 0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(220, 53, 69, 0.3)'"
                        >
                            <i class="bi bi-x-circle"></i> Avboka
                        </button>
                        <p style="margin: 8px 0 0 0; color: #6c757d; font-size: 0.85rem;">
                            Kan avbokas fram till startdatum
                        </p>
                    ` : `
                        <div style="
                            background: rgba(108, 117, 125, 0.1);
                            border: 2px dashed #6c757d;
                            border-radius: 12px;
                            padding: 16px 12px;
                            text-align: center;
                        ">
                            <i class="bi bi-info-circle" style="color: #6c757d; font-size: 1.2rem; display: block; margin-bottom: 8px;"></i>
                            <span style="color: #6c757d; font-style: italic; font-size: 0.9rem;">
                                ${booking.status === 'ACTIVE' ? 'Kan inte avbokas' : 'Bokning avslutad'}
                            </span>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        return bookingDiv;
    }

    // Hanterar avbokning av en bokning
    async cancelBooking(rentalId) {
        console.log(`🚫 Försöker avboka bokning ID: ${rentalId}`);
        
        if (!confirm('Är du säker på att du vill avboka denna bokning? Denna åtgärd kan inte ångras.')) {
            console.log('❌ Avbokning avbruten av användaren');
            return;
        }
        
        try {
            const apiUrl = `${CONFIG.API_BASE_URL}/rentals/${rentalId}/cancel`;
            console.log('🌐 Avboknings-API-anrop till:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📊 Avboknings-API svar status:', response.status);
            
            if (response.ok) {
                console.log('✅ Bokning avbokad framgångsrikt');
                alert('Bokningen har avbokats framgångsrikt.');
                await this.loadAndDisplayBookings(); // Ladda om bokningarna
            } else {
                const errorText = await response.text();
                console.error('❌ Avbokning misslyckades:', errorText);
                alert('Kunde inte avboka bokningen: ' + errorText);
            }
        } catch (error) {
            console.error('❌ Fel vid avbokning:', error);
            alert('Ett tekniskt fel uppstod vid avbokningen. Försök igen om en stund.');
        }
    }

    // Visar laddningstillstånd
    showLoadingState() {
        console.log('⏳ Visar laddningstillstånd...');
        
        const ongoingContainer = document.getElementById('ongoingBookings');
        const historyContainer = document.getElementById('historyBookings');
        
        const loadingHtml = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Laddar bokningar...</span>
                </div>
                <p class="mt-2">Laddar dina bokningar...</p>
            </div>
        `;
        
        if (ongoingContainer) {
            const header = ongoingContainer.querySelector('h3');
            ongoingContainer.innerHTML = '';
            if (header) ongoingContainer.appendChild(header);
            ongoingContainer.insertAdjacentHTML('beforeend', loadingHtml);
        }
        
        if (historyContainer) {
            const header = historyContainer.querySelector('h3');
            historyContainer.innerHTML = '';
            if (header) historyContainer.appendChild(header);
            historyContainer.insertAdjacentHTML('beforeend', loadingHtml);
        }
    }

    // Döljer laddningstillstånd
    hideLoadingState() {
        console.log('✅ Döljer laddningstillstånd...');
        // Laddningstillståndet försvinner automatiskt när nytt innehåll renderas
    }

    // Visar felmeddelande
    showErrorMessage(message) {
        console.error('❌ Visar felmeddelande:', message);
        
        const errorHtml = `
            <div class="alert alert-danger text-center">
                <i class="bi bi-exclamation-triangle"></i>
                <h5>Ett fel uppstod</h5>
                <p>${message}</p>
                <button class="btn btn-primary btn-sm" onclick="location.reload()">
                    <i class="bi bi-arrow-clockwise"></i> Ladda om sidan
                </button>
            </div>
        `;
        
        const ongoingContainer = document.getElementById('ongoingBookings');
        const historyContainer = document.getElementById('historyBookings');
        
        if (ongoingContainer) {
            const header = ongoingContainer.querySelector('h3');
            ongoingContainer.innerHTML = '';
            if (header) ongoingContainer.appendChild(header);
            ongoingContainer.insertAdjacentHTML('beforeend', errorHtml);
        }
        
        if (historyContainer) {
            const header = historyContainer.querySelector('h3');
            historyContainer.innerHTML = '';
            if (header) historyContainer.appendChild(header);
            historyContainer.insertAdjacentHTML('beforeend', `
                <div class="alert alert-warning text-center">
                    <p>Historik kunde inte laddas på grund av samma fel.</p>
                </div>
            `);
        }
    }
}

// Globala variabler och funktioner
let bookingsManager;

// Funktion för att växla mellan pågående och historik (används av HTML onclick)
function showBookings(type) {
    const ongoingBtn = document.getElementById('btnOngoing');
    const historyBtn = document.getElementById('btnHistory');
    const ongoingList = document.getElementById('ongoingBookings');
    const historyList = document.getElementById('historyBookings');
    
    if (type === 'ongoing') {
        ongoingBtn?.classList.add('active');
        historyBtn?.classList.remove('active');
        ongoingList?.classList.add('active');
        historyList?.classList.remove('active');
    } else {
        historyBtn?.classList.add('active');
        ongoingBtn?.classList.remove('active');
        historyList?.classList.add('active');
        ongoingList?.classList.remove('active');
    }
}

// Initialisering när DOM är redo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOM är redo, startar BookingsManager...');
    
    try {
        bookingsManager = new BookingsManager();
        await bookingsManager.initialize();
    } catch (error) {
        console.error('💥 Kritiskt fel vid initialisering:', error);
        alert('Ett allvarligt fel uppstod. Försök ladda om sidan.');
    }
});

console.log('📄 Självständig my-bookings.js laddad framgångsrikt');