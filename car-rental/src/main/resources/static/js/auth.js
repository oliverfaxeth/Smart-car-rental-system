// Autentiseringsfunktioner för NextCar

// Kontrollerar om användaren är inloggad
const isAuthenticated = () => {
    return !!(localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken'));
};

// Returnerar token från localStorage eller sessionStorage
const getToken = () => {
    return localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
};

// Returnerar användarroll (CUSTOMER eller ADMIN) från webbläsarens lagring
// Vid inloggning sparades användarroll i antingen localStorage (om "Kom ihåg mig" valdes)
// eller i sessionStorage (om "Kom ihåg mig" inte valdes).
// Funktionen kollar i båda lagringsplatserna och returnerar värdet från den första som hittas.
// Om ingen användarroll finns sparad (användaren inte inloggad) returneras null.
const getUserRole = () => {
    return localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
};

// Returnerar användar-ID (userId) från webbläsarens lagring
// Vid inloggning sparades userId i antingen localStorage (om "Kom ihåg mig" valdes)
// eller i sessionStorage (om "Kom ihåg mig" inte valdes).
// Funktionen kollar i båda lagringsplatserna och returnerar värdet från den första som hittas.
// Om inget användar-ID finns sparat (användaren inte inloggad) returneras null.
const getUserId = () => {
    return localStorage.getItem('userId') || sessionStorage.getItem('userId');
};

// Skapar en Authorization-header för API-anrop som kräver autentisering
// Hämtar JWT-token med getToken() och formaterar en header enligt Bearer-token formatet
// som används för att autentisera API-anrop till backenden.
// Om token finns: returneras ett objekt { 'Authorization': 'Bearer [token]' }
// Om token inte finns: returneras ett tomt objekt {}
const getAuthHeader = () => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Loggar ut användaren genom att rensa tokens
const logout = () => {
    // Ta bort alla tokens och användarinfo
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
    
    // Redirecta till startsidan
    window.location.href = 'index.html';
};

// Uppdaterar gränssnittet baserat på användarens inloggningsstatus
const updateLoginUI = () => {
    if (isAuthenticated()) {
        const firstName = localStorage.getItem('firstName') || sessionStorage.getItem('firstName');
        const userRole = getUserRole();
        
        // Hitta login/register-knapparna
        const loginBtn = document.querySelector('.btn-login-red');
        const registerBtn = document.querySelector('.btn-register');
        
        if (loginBtn && registerBtn) {
            // Byt ut mot profilknapp och logga ut-knapp
            const navContainer = loginBtn.parentElement;
            navContainer.innerHTML = `
                <a href="${userRole === 'ADMIN' ? 'admin/dashboard.html' : 'profile.html'}" class="btn-profile" style="text-decoration: none;">
                    <i class="bi bi-person-circle"></i> ${firstName || (userRole === 'ADMIN' ? 'Admin' : 'Profil')}
                </a>
                <a href="#" id="logoutBtn" class="btn-logout" style="text-decoration: none; margin-left: 10px;">
                    <i class="bi bi-box-arrow-right"></i> Logga ut
                </a>
            `;
            
            // Lägg till utloggningsfunktion
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    }
};

// Skydda sidor som kräver inloggning
const protectPage = (requiredRole = null) => {
    if (!isAuthenticated()) {
        // Spara nuvarande URL för att kunna återvända efter inloggning
        sessionStorage.setItem('referrer', window.location.href);
        // Omdirigera till inloggningssidan
        window.location.href = 'login.html';
        return false;
    }
    
    // Om en specifik roll krävs, kontrollera denna
    if (requiredRole && getUserRole() !== requiredRole) {
        // Omdirigera till startsidan om användaren inte har rätt roll
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
};

// Funktion för att redirecta till referrer eller annan sida
const redirectToReferrer = (defaultUrl = 'index.html') => {
    // Kontrollera om det finns en referrer URL sparad
    const referrer = sessionStorage.getItem('referrer');
    if (referrer) {
        sessionStorage.removeItem('referrer');
        window.location.href = referrer;
    } else {
        // Annars redirecta till defaultUrl
        window.location.href = defaultUrl;
    }
};

// Kör updateLoginUI när DOM är redo
document.addEventListener('DOMContentLoaded', updateLoginUI);