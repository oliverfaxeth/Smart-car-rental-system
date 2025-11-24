/*
 * NEXTCAR BOKNINGSHANTERARE (v2.0)
 * 
 * Komplett omskriven version med 4-kategori bokningssystem:
 * - BEKRÄFTADE: Bokade men inte startade än
 * - AKTIVA: Pågående uthyrningar
 * - AVSLUTADE: Genomförda bokningar
 * - AVBOKADE: Cancelled bokningar
 */

console.log('🚀 NextCar BookingsManager v2.0 startar...');

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
class NextCarBookingsManager {
    constructor() {
        this.currentUserId = null;
        this.currentUserName = null;
        this.authToken = null;
        this.isInitialized = false;
        this.allBookings = [];
    }

    // ===== INITIALISERING =====
    
    async initialize() {
        console.log('📱 NextCarBookingsManager: Startar initialisering...');
        
        try {
            this.loadAuthenticationData();
            
            if (!this.isUserAuthenticated()) {
                this.redirectToLogin();
                return;
            }
            
            this.updateNavigationUI();
            await this.loadAndCategorizeBookings();
            
            this.isInitialized = true;
            console.log('✅ NextCarBookingsManager: Initialisering slutförd');
            
        } catch (error) {
            console.error('❌ NextCarBookingsManager: Fel under initialisering:', error);
            this.showErrorMessage('Ett fel uppstod under laddningen. Försök ladda om sidan.');
        }
    }

    // ===== AUTENTISERING =====

    loadAuthenticationData() {
        console.log('🔑 Hämtar autentiseringsdata...');
        
        this.currentUserId = this.getFromStorage(CONFIG.STORAGE_KEYS.USER_ID);
        this.currentUserName = this.getFromStorage(CONFIG.STORAGE_KEYS.FIRST_NAME);
        this.authToken = this.getFromStorage(CONFIG.STORAGE_KEYS.JWT_TOKEN);
        
        console.log('🆔 Användar-ID:', this.currentUserId);
        console.log('👤 Användarnamn:', this.currentUserName);
        console.log('🎫 Token finns:', !!this.authToken);
    }

    getFromStorage(key) {
        let value = localStorage.getItem(key);
        if (!value || value === 'null' || value === 'undefined') {
            value = sessionStorage.getItem(key);
        }
        return (value && value !== 'null' && value !== 'undefined') ? value : null;
    }

    isUserAuthenticated() {
        const isAuthenticated = !!(this.currentUserId && this.authToken);
        console.log('🔍 Autentiseringsstatus:', isAuthenticated ? 'Autentiserad' : 'Ej autentiserad');
        return isAuthenticated;
    }

    redirectToLogin() {
        console.log('🔄 Omdirigerar till inloggningssida...');
        alert('Du måste logga in för att se dina bokningar.');
        window.location.href = 'login.html';
    }

    updateNavigationUI() {
        console.log('🎨 Uppdaterar navigations-UI...');
        
        const authButtons = document.getElementById('authButtons');
        if (!authButtons) return;

        const userName = this.currentUserName || 'Användare';
        
        authButtons.innerHTML = `
            <div class="profile-dropdown">
                <button type="button" class="btn-profile" onclick="toggleProfileDropdown()" style="text-decoration: none; border: none;">
                    <i class="bi bi-person-circle"></i> ${userName}
                    <i class="bi bi-chevron-down dropdown-chevron"></i>
                </button>
                <div class="profile-dropdown-menu">
                    <a href="my-bookings.html" class="profile-dropdown-item bookings" style="font-weight: 600; background-color: #f8f9fa;">
                        <i class="bi bi-calendar-check"></i>
                        <span>Mina Bokningar</span>
                    </a>
                    <a href="profile.html" class="profile-dropdown-item profile">
                        <i class="bi bi-person-gear"></i>
                        <span>Redigera Profil</span>
                    </a>
                </div>
            </div>
            <a href="#" id="logoutBtn" class="btn-logout">
                <i class="bi bi-box-arrow-right"></i> Logga ut
            </a>
        `;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    logout() {
        console.log('🚪 Loggar ut användare...');
        
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        
        window.location.href = 'index.html';
    }

    // ===== BOKNINGSHANTERING =====

    async loadAndCategorizeBookings() {
        console.log('📚 Startar laddning och kategorisering av bokningar...');
        
        try {
            this.showLoadingState();
            
            // Hämta alla bokningar från API
            this.allBookings = await this.fetchBookingsFromAPI();
            
            // Kategorisera bokningarna
            const categories = this.categorizeBookings(this.allBookings);
            
            // Rendera alla kategorier
            this.renderAllCategories(categories);
            
            this.hideLoadingState();
            
        } catch (error) {
            console.error('❌ Fel vid laddning av bokningar:', error);
            this.hideLoadingState();
            this.showErrorMessage(`Kunde inte ladda bokningar: ${error.message}`);
        }
    }

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
        
        if (!response.ok) {
            throw new Error(`API-anrop misslyckades med status ${response.status}`);
        }
        
        const bookings = await response.json();
        console.log('📦 Antal bokningar mottagna:', bookings.length);
        
        return bookings;
    }

    categorizeBookings(bookings) {
        console.log('📂 Kategoriserar bokningar i 4 kategorier...');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const confirmed = bookings.filter(booking => {
            const startDate = new Date(booking.startDate);
            return booking.status === 'ACTIVE' && startDate > today;
        });
        
        const active = bookings.filter(booking => {
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            return booking.status === 'ACTIVE' && startDate <= today && endDate >= today;
        });
        
        const completed = bookings.filter(booking => {
            const endDate = new Date(booking.endDate);
            return booking.status === 'COMPLETED' || 
                   (booking.status === 'ACTIVE' && endDate < today);
        });
        
        const cancelled = bookings.filter(booking => {
            return booking.status === 'CANCELLED';
        });
        
        console.log('✅ Bekräftade:', confirmed.length);
        console.log('🚗 Aktiva:', active.length);
        console.log('📋 Avslutade:', completed.length);
        console.log('❌ Avbokade:', cancelled.length);
        
        return { confirmed, active, completed, cancelled };
    }

    // ===== RENDERING =====

    renderAllCategories({ confirmed, active, completed, cancelled }) {
        console.log('🎨 Renderar alla bokningskategorier...');
        
        this.renderBookingCategory('confirmed', confirmed, true);  // Kan avbokas
        this.renderBookingCategory('active', active, false);      // Kan ej avbokas (pågående)
        this.renderBookingCategory('completed', completed, false); // Kan ej avbokas (avslutad)
        this.renderBookingCategory('cancelled', cancelled, false); // Kan ej avbokas (redan avbokad)
        
        console.log('✅ Alla kategorier renderade');
    }

    renderBookingCategory(categoryName, bookings, canCancel) {
        const containerId = `${categoryName}Bookings`;
        const emptyStateId = `empty${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`;
        
        const container = document.getElementById(containerId);
        const emptyState = document.getElementById(emptyStateId);
        
        if (!container) {
            console.error(`❌ ${containerId} container hittas inte`);
            return;
        }
        
        // Behåll headern men rensa övrigt innehåll
        const header = container.querySelector('h3');
        container.innerHTML = '';
        if (header) {
            container.appendChild(header);
        }
        
        if (bookings.length === 0) {
            console.log(`📭 Inga ${categoryName} bokningar att visa`);
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
            console.log(`📄 Renderar ${categoryName} bokning ${index + 1}: ${booking.car.brand} ${booking.car.model}`);
            const bookingElement = this.createBookingCard(booking, canCancel);
            container.appendChild(bookingElement);
        });
    }

    createBookingCard(booking, canCancel) {
        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'booking-card';
        
        // Bestäm VERKLIG status baserat på datum och databas-status
        const actualStatus = this.determineActualStatus(booking);
        const { statusText, statusBg } = this.getStatusStyle(actualStatus);
        
        // Kontrollera om bokningen faktiskt kan avbokas
        const canActuallyCancel = canCancel && 
            booking.status === 'ACTIVE' && 
            new Date(booking.startDate) > new Date();
        
        // Formatera datum
        const startDate = new Date(booking.startDate).toLocaleDateString('sv-SE');
        const endDate = new Date(booking.endDate).toLocaleDateString('sv-SE');
        
        // Beräkna antal dagar
        const startDateObj = new Date(booking.startDate);
        const endDateObj = new Date(booking.endDate);
        const daysDifference = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
        
        bookingDiv.innerHTML = `
            <!-- Status accent-linje -->
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
                    color: white; 
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
            
            <!-- Informationsraster -->
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: start;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                    <!-- Period -->
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
                    
                    <!-- Bokningsnummer -->
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
                    
                    <!-- Pris -->
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
                
                <!-- Åtgärdssektion -->
                <div style="text-align: center; min-width: 140px;">
                    ${canActuallyCancel ? `
                        <button 
                            class="btn btn-danger" 
                            onclick="nextCarBookingsManager.cancelBooking(${booking.id})"
                            style="
                                white-space: nowrap;
                                padding: 12px 20px;
                                font-weight: 600;
                                border-radius: 25px;
                                border: none;
                                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                                box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
                                transition: all 0.3s ease;
                                color: white;
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
                                ${this.getCancelReasonText(booking)}
                            </span>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        return bookingDiv;
    }

    getStatusStyle(status) {
        switch (status) {
            case 'ACTIVE':
                return {
                    statusText: 'AKTIV',
                    statusBg: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                };
            case 'CANCELLED':
                return {
                    statusText: 'AVBOKAD',
                    statusBg: 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)'
                };
            case 'COMPLETED':
                return {
                    statusText: 'AVSLUTAD',
                    statusBg: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                };
            case 'CONFIRMED':
                return {
                    statusText: 'BEKRÄFTAD',
                    statusBg: 'linear-gradient(135deg, #ffc107 0%, #e6a800 100%)'
                };
            default:
                return {
                    statusText: 'OKÄND',
                    statusBg: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                };
        }
    }

    // Bestämmer verklig status för visning baserat på databas-status och datum
    determineActualStatus(booking) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        
        // Om bokad i databasen som CANCELLED, visa som CANCELLED
        if (booking.status === 'CANCELLED') {
            return 'CANCELLED';
        }
        
        // Om bokad i databasen som COMPLETED, visa som COMPLETED
        if (booking.status === 'COMPLETED') {
            return 'COMPLETED';
        }
        
        // Om ACTIVE i databasen, bestäm baserat på datum
        if (booking.status === 'ACTIVE') {
            if (endDate < today) {
                // Slutdatum har passerat = AVSLUTAD
                return 'COMPLETED';
            } else if (startDate <= today && endDate >= today) {
                // Pågående = AKTIV
                return 'ACTIVE';
            } else if (startDate > today) {
                // Framtida = BEKRÄFTAD
                return 'CONFIRMED';
            }
        }
        
        // Fallback
        return booking.status;
    }

    getCancelReasonText(booking) {
        if (booking.status === 'CANCELLED') {
            return 'Redan avbokad';
        } else if (booking.status === 'COMPLETED') {
            return 'Bokning genomförd';
        } else if (booking.status === 'ACTIVE' && new Date(booking.endDate) < new Date()) {
            return 'Bokning avslutad';
        } else if (booking.status === 'ACTIVE' && new Date(booking.startDate) <= new Date()) {
            return 'Pågående uthyrning';
        } else {
            return 'Kan inte avbokas';
        }
    }

    // ===== AVBOKNING =====

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
            
            if (response.ok) {
                console.log('✅ Bokning avbokad framgångsrikt');
                alert('Bokningen har avbokats framgångsrikt.');
                await this.loadAndCategorizeBookings(); // Ladda om alla bokningar
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

    // ===== UI TILLSTÅND =====

    showLoadingState() {
        console.log('⏳ Visar laddningstillstånd...');
        
        const loadingHtml = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Laddar bokningar...</span>
                </div>
                <p class="mt-2">Laddar dina bokningar...</p>
            </div>
        `;
        
        const containers = ['confirmedBookings', 'activeBookings', 'completedBookings', 'cancelledBookings'];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                const header = container.querySelector('h3');
                container.innerHTML = '';
                if (header) container.appendChild(header);
                container.insertAdjacentHTML('beforeend', loadingHtml);
            }
        });
    }

    hideLoadingState() {
        console.log('✅ Döljer laddningstillstånd...');
        // Laddningstillståndet försvinner automatiskt när nytt innehåll renderas
    }

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
        
        // Visa fel i den aktiva containern
        const activeContainer = document.querySelector('.bookings-list.active') || 
                               document.getElementById('confirmedBookings');
        
        if (activeContainer) {
            const header = activeContainer.querySelector('h3');
            activeContainer.innerHTML = '';
            if (header) activeContainer.appendChild(header);
            activeContainer.insertAdjacentHTML('beforeend', errorHtml);
        }
    }
}

// ===== GLOBAL VARIABEL OCH FUNKTIONER =====

let nextCarBookingsManager;

// Funktion för att växla mellan bokningsvyer (används av HTML onclick)
function switchBookingView(viewType) {
    console.log(`🔄 Växlar till vy: ${viewType}`);
    
    const buttons = ['btnConfirmed', 'btnActive', 'btnCompleted', 'btnCancelled'];
    const containers = ['confirmedBookings', 'activeBookings', 'completedBookings', 'cancelledBookings'];
    
    // Reset alla knappar och containers
    buttons.forEach(id => document.getElementById(id)?.classList.remove('active'));
    containers.forEach(id => document.getElementById(id)?.classList.remove('active'));
    
    // Aktivera vald vy
    const activeButton = `btn${viewType.charAt(0).toUpperCase() + viewType.slice(1)}`;
    const activeContainer = `${viewType}Bookings`;
    
    document.getElementById(activeButton)?.classList.add('active');
    document.getElementById(activeContainer)?.classList.add('active');
    
    // Smooth scroll
    const bookingsContainer = document.querySelector('.bookings-container');
    bookingsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== INITIALISERING =====

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOM är redo, startar NextCarBookingsManager v2.0...');
    
    try {
        nextCarBookingsManager = new NextCarBookingsManager();
        await nextCarBookingsManager.initialize();
    } catch (error) {
        console.error('💥 Kritiskt fel vid initialisering:', error);
        alert('Ett allvarligt fel uppstod. Försök ladda om sidan.');
    }
});

console.log('📄 NextCar BookingsManager v2.0 laddad framgångsrikt');

// Profile dropdown funktioner för my-bookings
function toggleProfileDropdown() {
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        dropdown.classList.remove('open');
    }
});