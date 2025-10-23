document.addEventListener("DOMContentLoaded", () => {
    // Hämta alla formulärelement
    const registerForm = document.getElementById("registerForm");
    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const phonePrefix = document.getElementById("phonePrefix");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const address = document.getElementById("address");
    const postalCode = document.getElementById("postalCode");
    const city = document.getElementById("city");
    const country = document.getElementById("country");

    // E-postvalidering med regex
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

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

    // Validera hela formuläret
    const validateForm = () => {
        // Rensa tidigare felmeddelanden
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        let isValid = true;

        // Validera förnamn
        if (!firstName.value.trim()) {
            displayError(firstName, "Förnamn måste anges");
            isValid = false;
        }

        // Validera efternamn
        if (!lastName.value.trim()) {
            displayError(lastName, "Efternamn måste anges");
            isValid = false;
        }

        // Validera e-post
        if (!email.value.trim()) {
            displayError(email, "E-post måste anges");
            isValid = false;
        } else if (!validateEmail(email.value)) {
            displayError(email, "Ogiltig e-postadress");
            isValid = false;
        }

        // Validera telefon
        if (!phone.value.trim()) {
            displayError(phone, "Telefonnummer måste anges");
            isValid = false;
        }

        // Validera lösenord
        if (!password.value) {
            displayError(password, "Lösenord måste anges");
            isValid = false;
        } else if (password.value.length < 8) {
            displayError(password, "Lösenord måste vara minst 8 tecken");
            isValid = false;
        }

        // Validera lösenordsbekräftelse
        if (!confirmPassword.value) {
            displayError(confirmPassword, "Bekräfta lösenord");
            isValid = false;
        } else if (password.value !== confirmPassword.value) {
            displayError(confirmPassword, "Lösenorden matchar inte");
            isValid = false;
        }

        // Validera adress
        if (!address.value.trim()) {
            displayError(address, "Adress måste anges");
            isValid = false;
        }

        // Validera postnummer
        if (!postalCode.value.trim()) {
            displayError(postalCode, "Postnummer måste anges");
            isValid = false;
        }

        // Validera stad
        if (!city.value.trim()) {
            displayError(city, "Stad måste anges");
            isValid = false;
        }

        // Validera land
        if (!country.value) {
            displayError(country, "Land måste väljas");
            isValid = false;
        }

        return isValid;
    };

    // Hantera formulärinskick
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validera formulär
        if (!validateForm()) {
            return;
        }

        // Förbered registreringsdata
        const registrationData = {
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            phone: `${phonePrefix.value}${phone.value.trim()}`,
            password: password.value,
            confirmPassword: confirmPassword.value,
            address: address.value.trim(),
            postalCode: postalCode.value.trim(),
            city: city.value.trim(),
            country: country.value
        };

        try {
            // Skicka registreringsdata till backend
            const response = await fetch('http://localhost:8080/customers/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData)
            });

            // Hantera svaret från servern
            if (response.ok) {
                // Registrering lyckades
                alert('Registrering lyckades! Du kan nu logga in.');
                window.location.href = '/login';
            } else {
                // Hantera felaktigt svar
                const errorMessage = await response.text();
                alert(errorMessage || 'Registrering misslyckades');
            }
        } catch (error) {
            console.error("Registreringsfel:", error);
            alert('Ett fel inträffade. Försök igen.');
        }
    });

    // Synkronisera land och telefonprefix
    phonePrefix.addEventListener('change', () => {
        const prefixToCountry = {
            '+46': 'SE',
            '+47': 'NO',
            '+45': 'DK',
            '+358': 'FI',
            '+49': 'DE',
            '+44': 'GB',
            '+33': 'FR',
            '+34': 'ES',
            '+1': 'US'
        };

        country.value = prefixToCountry[phonePrefix.value];
    });
});