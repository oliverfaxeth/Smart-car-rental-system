// carService.js - Ansvarar för all kommunikation med backend gällande bilar

const API_BASE_URL = 'http://localhost:8080';

/**
 * Hämtar alla bilar från databasen
 * Denna funktion gör ett GET-anrop till backend och returnerar en lista med bilar
 */
async function getAllCars() {
    try {
        // Gör ett fetch-anrop till backend API:et
        const response = await fetch(`${API_BASE_URL}/cars`);
        
        // Kontrollera om anropet lyckades
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Konvertera svaret från JSON till JavaScript-objekt
        const cars = await response.json();
        
        console.log('Hämtade bilar från databas:', cars);
        console.log('Första bilens imageUrl:', cars[0]?.imageUrl);

        return cars;
        
    } catch (error) {
        console.error('Fel vid hämtning av bilar:', error);
        return []; // Returnera tom array om något går fel
    }
}