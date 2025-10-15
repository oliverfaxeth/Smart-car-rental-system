document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");

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

    // Validering av formulär
    const validateForm = () => {
        // Rensa tidigare felmeddelanden
        document.querySelectorAll('.error-message').forEach(el => el.remove());

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
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            // Hantera svaret från servern
            if (response.ok) {
                // Hämta JWT-token
                const token = await response.text();
                
                // Spara token (med eller utan "Remember me")
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('jwtToken', token);
                } else {
                    sessionStorage.setItem('jwtToken', token);
                }

                // Kontrollera om det finns en väntande bokning
                const pendingBooking = sessionStorage.getItem('pendingBooking');
                
                if (pendingBooking) {
                    // Parse bokningsinformation
                    const booking = JSON.parse(pendingBooking);
                    
                    // Ta bort den tillfälliga bokningsinformationen
                    sessionStorage.removeItem('pendingBooking');
                    
                    // Redirecta tillbaka till startsidan med bokningsinformation
                    window.location.href = `/?carId=${booking.carId}&startDate=${booking.startDate}&endDate=${booking.endDate}`;
                } else {
                    // Normal redirectning om ingen väntande bokning
                    window.location.href = '/';
                }
            } else {
                // Hantera felaktigt inloggningsförsök
                const errorMessage = await response.text();
                alert(errorMessage || 'Inloggning misslyckades');
            }
        } catch (error) {
            console.error("Inloggningsfel:", error);
            alert('Ett fel inträffade. Försök igen.');
        }
    });

    // Glömt lösenord-länk
    const forgotPasswordLink = document.querySelector('a[href="#"]');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funktionen för att återställa lösenord är inte implementerad ännu.');
        });
    }
});