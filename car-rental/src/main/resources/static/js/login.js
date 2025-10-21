document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    
    // LÄGG TILL: Kontrollera om användaren redan är inloggad
    // Detta förhindrar att redan inloggade användare ser login-sidan.
    // Om de redan har en token bör de omdirigeras till föregående sida eller startsidan.
    // Använd gemensam autentiseringsfunktion från auth.js
    if (isAuthenticated()) {
        redirectToReferrer();
    }

    // Funktion för att visa felmeddelanden
    const displayError = (input, message) => {
        // Ta bort tidigare felmeddelanden
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-danger small mt-1';
        errorDiv.textContent = message;
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    };

    // LÄGG TILL: Funktion för att visa generella felmeddelanden
    // Detta behövs för att visa backend-felmeddelanden högst upp i formuläret
    // istället för kopplat till specifika fält. T.ex. "Fel e-post eller lösenord"
    const displayGeneralError = (message) => {
        // Ta bort tidigare generella felmeddelanden
        const existingErrors = document.querySelectorAll('.general-error');
        existingErrors.forEach(error => error.remove());

        const errorDiv = document.createElement('div');
        errorDiv.className = 'general-error alert alert-danger mt-3 mb-3';
        errorDiv.textContent = message;
        loginForm.prepend(errorDiv);
    };

    // Validering av formulär
    const validateForm = () => {
        // Rensa tidigare felmeddelanden
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        // LÄGG TILL: Rensa generella felmeddelanden också
        document.querySelectorAll('.general-error').forEach(el => el.remove());

        let isValid = true;

        // Validera e-post
        if (!emailInput.value.trim()) {
            displayError(emailInput, "E-post måste anges");
            isValid = false;
        }

        // Validera lösenord
        if (!passwordInput.value) {
            displayError(passwordInput, "Lösenord måste anges");
            isValid = false;
        }

        return isValid;
    };

    // Hantera formulärinskick
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validera formulär
        if (!validateForm()) {
            return;
        }

        // Förbered inloggningsdata
        const loginData = {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        try {
            // Skicka inloggningsdata till backend
            // UPPDATERA: Ändra URL-sökvägen till /api/auth/login enligt nya API-strukturen
            // Detta matchar den uppdaterade backend-endpointstrukturen i AuthController
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            // Hantera svaret från servern
            if (response.ok) {
                // UPPDATERA: Ändra från text() till json() för att hantera strukturerad svarsdata
                // Backend returnerar nu JSON med token + användarinfo istället för bara token-text
                const data = await response.json();
                
                // UPPDATERA: Spara token och användarinfo (inte bara token)
                // Detta gör att vi kan visa användarnamn i UI och använda användarroll för åtkomstkontroll
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('jwtToken', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('firstName', data.firstName);
                    localStorage.setItem('lastName', data.lastName);
                } else {
                    sessionStorage.setItem('jwtToken', data.token);
                    sessionStorage.setItem('userId', data.userId);
                    sessionStorage.setItem('userRole', data.role);
                    sessionStorage.setItem('firstName', data.firstName);
                    sessionStorage.setItem('lastName', data.lastName);
                }
                
                // LÄGG TILL: Redirect till föregående sida eller startsidan
                // Detta fullföljer inloggningsflödet genom att skicka användaren till 
                // sidan de försökte nå innan inloggning, eller till startsidan
                redirectToReferrer();
            } else {
                // UPPDATERA: Bättre felhantering med JSON-svar från backend
                // Detta visar felmeddelanden från backend korrekt för användaren
                try {
                    const errorData = await response.json();
                    displayGeneralError(errorData.message || "Fel e-post eller lösenord");
                } catch (e) {
                    // Om svaret inte är JSON
                    const errorText = await response.text();
                    displayGeneralError(errorText || "Fel e-post eller lösenord");
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            // LÄGG TILL: Visa felmeddelande vid nätverksfel eller andra oväntade fel
            displayGeneralError("Ett tekniskt fel uppstod. Försök igen senare.");
        }
        
        // LÄGG TILL: sessionStorage-inställning saknas i den befintliga koden
        // Detta bör implementeras för att slutföra if/else-grenen som börjar ovan
    });
});