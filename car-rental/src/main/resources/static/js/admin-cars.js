// ===== ADMIN CARS JAVASCRIPT =====
// Hanterar "Lägg till bil" funktionalitet för admin-panelen

class AdminCarsManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8080';
        this.categories = [];
        this.currentEditingCarId = null;
        
        this.initializeEventListeners();
        this.loadCategories();
        this.loadCars();
    }

    // ===== INITIALIZATION =====
    initializeEventListeners() {
        console.log('🚀 Initialiserar Admin Cars Manager...');
        
        // "Lägg till bil"-knapp
        const addCarBtn = document.getElementById('addCarBtn');
        if (addCarBtn) {
            addCarBtn.addEventListener('click', () => this.openAddCarModal());
        }

        // "Spara bil"-knapp i modal
        const saveCarBtn = document.getElementById('saveCarBtn');
        if (saveCarBtn) {
            saveCarBtn.addEventListener('click', () => this.handleSaveCarSubmit());
        }

        // Modal reset när den stängs
        const carModal = document.getElementById('carModal');
        if (carModal) {
            carModal.addEventListener('hidden.bs.modal', () => this.resetModal());
        }
    }

    // ===== KATEGORI-HANTERING =====
    async loadCategories() {
        console.log('📂 Laddar kategorier från API...');
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/categories`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.categories = await response.json();
            console.log('✅ Kategorier laddade:', this.categories);
            
            this.populateCategoryDropdown();
            
        } catch (error) {
            console.error('❌ Fel vid laddning av kategorier:', error);
            this.showErrorMessage('Kunde inte ladda kategorier. Kontrollera att backend körs.');
        }
    }

    populateCategoryDropdown() {
        const categorySelect = document.getElementById('carCategory');
        if (!categorySelect) return;

        // Rensa befintliga options (behåll bara placeholder)
        categorySelect.innerHTML = '<option value="">Välj kategori</option>';

        // Lägg till alla kategorier från API
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        console.log('✅ Kategori-dropdown populerad med', this.categories.length, 'kategorier');
    }

    // ===== MODAL-HANTERING =====
    openAddCarModal() {
        console.log('➕ Öppnar "Lägg till bil"-modal...');
        
        // Sätt modal-titel
        const modalTitle = document.getElementById('carModalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Lägg till Bil';
        }

        // Sätt knapp-text
        const saveBtn = document.getElementById('saveCarBtn');
        if (saveBtn) {
            saveBtn.textContent = 'Spara Bil';
        }

        // Reset form och sätt mode
        this.currentEditingCarId = null;
        this.resetFormValidation();

        // Visa modal
        const carModal = new bootstrap.Modal(document.getElementById('carModal'));
        carModal.show();
    }

    resetModal() {
        console.log('🧹 Återställer modal...');
        
        // Reset form
        const form = document.getElementById('carForm');
        if (form) {
            form.reset();
        }
        
        // Reset validation state
        this.resetFormValidation();
        this.currentEditingCarId = null;
    }

    resetFormValidation() {
        // Ta bort alla error-klasser och meddelanden
        const form = document.getElementById('carForm');
        if (!form) return;

        // Ta bort Bootstrap validation klasser
        form.classList.remove('was-validated');
        
        // Ta bort custom error styling
        const inputs = form.querySelectorAll('.form-control, .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
            
            // Ta bort error-meddelanden
            const errorDiv = input.parentNode.querySelector('.invalid-feedback');
            if (errorDiv) {
                errorDiv.remove();
            }
        });
    }

    // ===== FORMULÄR-HANTERING =====
    async handleSaveCarSubmit() {
        console.log('💾 Hanterar formulär-submit...');
        
        const form = document.getElementById('carForm');
        if (!form) return;

        // Samla formulärdata
        const formData = this.collectFormData();
        
        // Klient-side validation först
        if (!this.validateFormData(formData)) {
            console.log('❌ Klient-side validation misslyckades');
            return;
        }

        // Visa loading state
        this.setLoadingState(true);

        try {
            // Skicka till backend
            const response = await fetch(`${this.apiBaseUrl}/cars`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // SUCCESS enligt acceptanskriterier
                console.log('✅ Bil skapad framgångsrikt:', result);
                
                // Visa bekräftelse: "Bil tillagd"
                this.showSuccessMessage(result.message || 'Bil tillagd');
                
                // Stäng modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('carModal'));
                modal.hide();
                
                // Reload bil-lista (redirect till bilöversikt enligt acceptanskriterier)
                await this.loadCars();
                
            } else {
                // Backend validation errors
                console.log('❌ Backend validation fel:', result);
                this.handleBackendValidationErrors(result.errors || {});
                this.showErrorMessage(result.message || 'Fel vid sparande av bil');
            }

        } catch (error) {
            console.error('❌ Network/Server error:', error);
            this.showErrorMessage('Kunde inte kommunicera med servern. Kontrollera att backend körs.');
        } finally {
            this.setLoadingState(false);
        }
    }

    collectFormData() {
        return {
            brand: document.getElementById('carBrand')?.value?.trim() || '',
            model: document.getElementById('carModel')?.value?.trim() || '',
            year: parseInt(document.getElementById('carYear')?.value) || null,
            fuel: document.getElementById('carFuel')?.value || '',
            transmission: document.getElementById('carTransmission')?.value || '',
            category: {
                id: parseInt(document.getElementById('carCategory')?.value) || null
            },
            seats: parseInt(document.getElementById('carSeats')?.value) || null,
            regNr: document.getElementById('carRegNr')?.value?.trim() || '',
            price: parseFloat(document.getElementById('carPrice')?.value) || null,
            imageUrl: document.getElementById('carImageUrl')?.value?.trim() || ''
        };
    }

    validateFormData(data) {
        let isValid = true;
        const errors = {};

        // Obligatoriska fält enligt acceptanskriterier
        if (!data.brand) errors.carBrand = 'Märke är obligatoriskt';
        if (!data.model) errors.carModel = 'Modell är obligatorisk';
        if (!data.year || data.year < 2015 || data.year > 2030) {
            errors.carYear = 'Årsmodell måste vara mellan 2015-2030';
        }
        if (!data.fuel) errors.carFuel = 'Bränsletyp är obligatorisk';
        if (!data.transmission) errors.carTransmission = 'Växellåda är obligatorisk';
        if (!data.category.id) errors.carCategory = 'Kategori är obligatorisk';
        if (!data.seats || data.seats < 2 || data.seats > 9) {
            errors.carSeats = 'Antal säten måste vara mellan 2-9';
        }
        if (!data.regNr) errors.carRegNr = 'Registreringsnummer är obligatoriskt';
        if (!data.price || data.price <= 0) {
            errors.carPrice = 'Pris måste vara större än 0';
        }
        // imageUrl är INTE obligatorisk (NICE TO HAVE enligt acceptanskriterier)

        if (Object.keys(errors).length > 0) {
            this.displayValidationErrors(errors);
            isValid = false;
        }

        return isValid;
    }

    displayValidationErrors(errors) {
        // Visa errors på respektive fält
        Object.entries(errors).forEach(([fieldId, message]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.add('is-invalid');
                
                // Skapa error message
                let errorDiv = field.parentNode.querySelector('.invalid-feedback');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    field.parentNode.appendChild(errorDiv);
                }
                errorDiv.textContent = message;
            }
        });
    }

    handleBackendValidationErrors(errors) {
        // Hantera errors från backend (samma struktur som våra klient-errors)
        this.displayValidationErrors(errors);
    }

    // ===== UI STATE MANAGEMENT =====
    setLoadingState(isLoading) {
        const saveBtn = document.getElementById('saveCarBtn');
        if (!saveBtn) return;

        if (isLoading) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Sparar...';
        } else {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Spara Bil';
        }
    }

    showSuccessMessage(message) {
        // Skapa en temporär success alert
        this.showAlert(message, 'success');
    }

    showErrorMessage(message) {
        // Skapa en temporär error alert  
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        // Skapa alert-element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto-remove efter 5 sekunder
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // ===== CAR LOADING (för bilöversikt) =====
    async loadCars() {
        console.log('🚗 Laddar bil-lista...');
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/cars`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const cars = await response.json();
            console.log('✅ Bilar laddade:', cars.length, 'bilar');
            
            // Rendera bil-tabellen
            this.renderCarsTable(cars);
            
        } catch (error) {
            console.error('❌ Fel vid laddning av bilar:', error);
            this.showErrorInTable('Kunde inte ladda bilar från servern');
        }
    }

    renderCarsTable(cars) {
        const tableBody = document.getElementById('carsTableBody');
        if (!tableBody) return;

        // Om inga bilar finns
        if (!cars || cars.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <i class="bi bi-car-front text-muted"></i>
                        <p class="mt-2 mb-0">Inga bilar hittades</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Rendera bil-rader med ny struktur
        tableBody.innerHTML = cars.map(car => `
            <tr>
                <td>
                    ${car.imageUrl ? 
                        `<img src="/images/${car.imageUrl}" alt="${car.brand} ${car.model}" 
                             style="width: 60px; height: 40px; object-fit: cover; border-radius: 5px;">` : 
                        `<div style="width: 60px; height: 40px; background: #f8f9fa; border-radius: 5px; 
                                    display: flex; align-items: center; justify-content: center;">
                            <i class="bi bi-car-front text-muted"></i>
                         </div>`
                    }
                </td>
                <td>
                    <strong>${car.brand} ${car.model}</strong>
                </td>
                <td>
                    <span class="badge bg-light text-dark">${car.regNr}</span>
                </td>
                <td>${car.year}</td>
                <td>
                    ${car.category ? car.category.name : 'Okänd'}
                </td>
                <td>
                    <strong>${car.price} kr</strong><br>
                    <small class="text-muted">per dag</small>
                </td>
                <td>
                    ${this.renderStatusBadge(car.status || 'ACTIVE')}
                </td>
                <td>
                    <div class="action-icons d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm" title="Redigera bil" onclick="adminCarsManager.editCar(${car.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-warning btn-sm" title="Inaktivera bil" onclick="adminCarsManager.inactivateCar(${car.id})">
                            <i class="bi bi-power"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Uppdatera pagination info
        this.updatePaginationInfo(cars.length);
    }

    renderStatusBadge(status) {
        const statusUpper = status.toUpperCase();
        
        if (statusUpper === 'ACTIVE') {
            return `<span class="badge" style="background-color: #22c55e; color: white; padding: 6px 12px; border-radius: 6px;">
                        <i class="bi bi-check-circle me-1"></i>ACTIVE
                    </span>`;
        } else if (statusUpper === 'INACTIVE') {
            return `<span class="badge" style="background-color: #ef4444; color: white; padding: 6px 12px; border-radius: 6px;">
                        <i class="bi bi-x-circle me-1"></i>INACTIVE
                    </span>`;
        } else {
            return `<span class="badge bg-secondary">
                        ${statusUpper}
                    </span>`;
        }
    }

    showErrorInTable(message) {
        const tableBody = document.getElementById('carsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p class="mt-2 mb-0">${message}</p>
                </td>
            </tr>
        `;
    }

    updatePaginationInfo(totalCars) {
        const paginationInfo = document.getElementById('paginationInfo');
        if (paginationInfo) {
            paginationInfo.textContent = `Visar ${totalCars} av ${totalCars} bilar`;
        }
    }

    // ===== REDIGERA FUNKTIONALITET =====
    async editCar(carId) {
        console.log('✏️ Redigera bil:', carId);
        
        try {
            // Hämta bil-data från API
            const response = await fetch(`${this.apiBaseUrl}/cars/${carId}`);
            if (!response.ok) throw new Error(`Kunde inte hämta bil: ${response.status}`);
            
            const car = await response.json();
            console.log('📝 Bil-data för redigering:', car);
            
            // Öppna modal i edit-mode
            this.openEditCarModal(car);
            
        } catch (error) {
            console.error('❌ Fel vid hämtning av bil för redigering:', error);
            this.showErrorMessage('Kunde inte hämta bil-information för redigering');
        }
    }

    openEditCarModal(car) {
        console.log('🔧 Öppnar redigera-modal för bil:', car.id);
        
        // Sätt modal i edit-mode
        this.currentEditingCarId = car.id;
        
        // Uppdatera modal-titel och knapp-text
        const modalTitle = document.getElementById('carModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `Redigera Bil: ${car.brand} ${car.model}`;
        }

        const saveBtn = document.getElementById('saveCarBtn');
        if (saveBtn) {
            saveBtn.textContent = 'Uppdatera Bil';
        }

        // Fyll formuläret med bil-data
        this.populateFormWithCarData(car);
        
        // Reset validation
        this.resetFormValidation();

        // Visa modal
        const carModal = new bootstrap.Modal(document.getElementById('carModal'));
        carModal.show();
    }

    populateFormWithCarData(car) {
        // Fyll alla fält med bil-data
        const fields = {
            'carBrand': car.brand,
            'carModel': car.model,
            'carYear': car.year,
            'carFuel': car.fuel,
            'carTransmission': car.transmission,
            'carCategory': car.category ? car.category.id : '',
            'carSeats': car.seats,
            'carRegNr': car.regNr,
            'carPrice': car.price,
            'carImageUrl': car.imageUrl || '',
            'carDescription': '' // Beskrivning finns inte i entiteten än
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value !== undefined && value !== null) {
                field.value = value;
            }
        });

        console.log('📝 Formulär fyllt med bil-data');
    }

    // Uppdaterad save-metod som hanterar både create och update
    async handleSaveCarSubmit() {
        console.log('💾 Hanterar formulär-submit...');
        
        const form = document.getElementById('carForm');
        if (!form) return;

        // Samla formulärdata
        const formData = this.collectFormData();
        
        // Klient-side validation först
        if (!this.validateFormData(formData)) {
            console.log('❌ Klient-side validation misslyckades');
            return;
        }

        // Visa loading state
        this.setLoadingState(true);

        try {
            let response;
            let successMessage;

            if (this.currentEditingCarId) {
                // UPDATE - Redigera befintlig bil
                response = await fetch(`${this.apiBaseUrl}/cars/${this.currentEditingCarId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                successMessage = 'Bil uppdaterad';
            } else {
                // CREATE - Skapa ny bil
                response = await fetch(`${this.apiBaseUrl}/cars`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                successMessage = 'Bil tillagd';
            }

            const result = await response.json();

            if (response.ok && result.success) {
                // SUCCESS
                console.log('✅ Bil sparad framgångsrikt:', result);
                
                // Visa bekräftelse
                this.showSuccessMessage(result.message || successMessage);
                
                // Stäng modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('carModal'));
                modal.hide();
                
                // Reload bil-lista
                await this.loadCars();
                
            } else {
                // Backend validation errors
                console.log('❌ Backend validation fel:', result);
                this.handleBackendValidationErrors(result.errors || {});
                this.showErrorMessage(result.message || 'Fel vid sparande av bil');
            }

        } catch (error) {
            console.error('❌ Network/Server error:', error);
            this.showErrorMessage('Kunde inte kommunicera med servern. Kontrollera att backend körs.');
        } finally {
            this.setLoadingState(false);
        }
    }

    inactivateCar(carId) {
        console.log('⏸️ Inaktivera bil:', carId);
        
        // Visa bekräftelse-dialog med power-symbol kontext
        if (confirm('Är du säker på att du vill inaktivera denna bil?\n\nBilen kommer inte längre vara tillgänglig för nya bokningar.')) {
            this.performCarInactivation(carId);
        }
    }

    async performCarInactivation(carId) {
        try {
            // TODO: Implementera API-anrop för att sätta status = 'INACTIVE'
            // För nu bara visa meddelande
            this.showErrorMessage('💡 Inaktivering av bil är inte implementerad än. Detta kommer i nästa version.');
            
        } catch (error) {
            console.error('❌ Fel vid inaktivering av bil:', error);
            this.showErrorMessage('Kunde inte inaktivera bil');
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM redo - startar Admin Cars Manager');
    
    // Kontrollera att vi är på rätt sida
    if (document.getElementById('addCarBtn')) {
        // Skapa global referens för onclick-handlers
        window.adminCarsManager = new AdminCarsManager();
    } else {
        console.log('ℹ️ Admin Cars Manager startas inte - ingen addCarBtn hittades');
    }
});

console.log('📁 admin-cars.js laddad');