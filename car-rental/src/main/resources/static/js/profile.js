//Vänta till det att sidan är laddad
document.addEventListener("DOMContentLoaded", async () => {
  //Hitta (getElementById) och lagra (const -variabelnamn-) referenser till inputfälten i formuläret, dessa är fälten där användarens profilinformation visas
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const addressInput = document.getElementById("address");
  const postalCodeInput = document.getElementById("postalCode");
  const cityInput = document.getElementById("city");
  const countryInput = document.getElementById("country");

  try {
    //Skicka ett GET-anrop till backend för att hämta den inloggade användarens data.
    //"/customers/me" betyder: hämta profilen för den inloggade användaren
    //JWT-token skickas automatiskt med genom funktionen getAuthHeader() (från auth.js)
    const response = await fetch("http://localhost:8080/customers/me", {
      method: "GET",
      headers: getAuthHeader(),
    });

    //Kontrollera om anropet lyckades (statuskod 200 OK)
    if (response.ok) {
      //Omvandla svaret (JSON) till ett JavaScript-objekt
      const data = await response.json();

      //Fyll in fälten på sidan med datan som kom från backend
      //Detta gör att användarens information visas direkt när sidan laddas
      firstNameInput.value = data.firstName;
      lastNameInput.value = data.lastName;

      emailInput.value = data.email;
      emailInput.readOnly = true; //För att visa användaren visuellt att email ej kan ändras

      phoneInput.value = data.phone;
      addressInput.value = data.address;
      postalCodeInput.value = data.postalCode;
      cityInput.value = data.city;
      countryInput.value = data.country;
    } else {
      console.error("Failed to fetch profile. HTTP status:", response.status);
      const text = await response.text();
      console.error("Backend says:", text);
    }
  } catch (error) {
    //Om det uppstod ett tekniskt fel, skriv ut det i konsolen
    console.error("Oväntat fel vid hämtning av profil", error);
    alert("Ett oväntat fel uppstod");
  }

  //Hitta formuläret där användaren ska klicka på "spara"
  //Lägg till en eventlistener för när användaren klickar på “Spara”-knappen
  //Detta förbereder nästa steg: att skicka uppdaterade uppgifter (PUT-anrop)
  const profileForm = document.getElementById("profileForm");
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //Hindra att sidan laddas om automatiskt när formuläret skickas

    //Skapa ett objekt med uppdaterad information
    //Dessa värden kommer direkt från fälten användaren ändrat
    try {
      inputObject = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        phone: phoneInput.value,
        address: addressInput.value,
        postalCode: postalCodeInput.value,
        city: cityInput.value,
        country: countryInput.value,
      };

      //Skicka ett PUT-anrop till backend med uppdaterad data
      //PUT används för att uppdatera befintlig information
      const response = await fetch("http://localhost:8080/customers/me", {
        method: "PUT",
        headers: {
          ...getAuthHeader(), // ... means “include everything returned by getAuthHeader()”
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputObject),
      });

      //Om uppdateringen lyckades
      if (response.ok) {
        console.log("Uppgifter är uppdaterade");
        alert("Uppgifter uppdaterade!");
        sessionStorage.setItem("firstName", firstNameInput.value); //Uppdatera fälten med nya uppgifter
        updateLoginUI(); //Uppdatera användargränssnittet med nya uppgifter (t.ex. namn i meny)
      } else {
        console.log("Fel vid uppdatering. Uppgifter ej uppdaterade");
        alert("Fel vid uppdatering. Uppgifter ej uppdaterade");
      }

      //Om det uppstod ett tekniskt fel
    } catch (error) {
      console.error("Fel vid PUT-anrop:", error);
      alert("Ett oväntat fel uppstod");
    }
  });
});
