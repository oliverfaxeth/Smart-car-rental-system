// ===== ADMIN CARS JAVASCRIPT =====
// Hanterar "Lägg till bil" funktionalitet för admin-panelen

class AdminCarsManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8080';
        this.categories = [];
        this.allCars = []; // Lagrar alla bilar för filtrering
        this.filteredCars = []; // Aktuellt visade bilar
        this.currentEditingCarId = null;
        
        this.initializeEventListeners();
        this.loadCategories();
        this.loadCars();
        this.createNotificationContainer();
        this.createConfirmationModal();
    }

    // ===== NOTIFICATION SYSTEM =====
    createNotificationContainer() {
        // Skapa container för toast-meddelanden
        if (!document.getElementById('toastContainer')) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
    }

    createConfirmationModal() {
        // Skapa bekräftelse-modal om den inte finns
        if (!document.getElementById('confirmModal')) {
            const modalHTML = `
                <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="confirmModalLabel">
                                    <i class="bi bi-question-circle text-warning me-2"></i>
                                    Bekräfta åtgärd
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p id="confirmModalMessage">Är du säker på att du vill fortsätta?</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="bi bi-x-circle me-1"></i>Avbryt
                                </button>
                                <button type="button" class="btn btn-danger" id="confirmModalBtn">
                                    <i class="bi bi-check-circle me-1"></i>Bekräfta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    // ===== FÖRBÄTTRADE NOTIFICATION-METODER =====
    showToast(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        // Skapa toast-element
        const toastId = 'toast_' + Date.now();
        const toastHTML = `
            <div class="toast align-items-center text-white bg-${this.getBootstrapColor(type)} border-0" 
                 id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi ${this.getToastIcon(type)} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                            data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);

        // Visa toast med Bootstrap
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: duration
        });
        toast.show();

        // Ta bort element efter att det försvunnit
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    getBootstrapColor(type) {
        const colors = {
            'success': 'success',
            'error': 'danger',
            'warning': 'warning',
            'info': 'info'
        };
        return colors[type] || 'info';
    }

    getToastIcon(type) {
        const icons = {
            'success': 'bi-check-circle',
            'error': 'bi-exclamation-triangle',
            'warning': 'bi-exclamation-circle',
            'info': 'bi-info-circle'
        };
        return icons[type] || 'bi-info-circle';
    }

    async showConfirm(title, message, confirmText = 'Bekräfta', confirmButtonClass = 'btn-danger') {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmModal');
            const messageElement = document.getElementById('confirmModalMessage');
            const confirmBtn = document.getElementById('confirmModalBtn');
            const titleElement = document.getElementById('confirmModalLabel');

            // Sätt innehåll
            if (titleElement) titleElement.innerHTML = `<i class="bi bi-question-circle text-warning me-2"></i>${title}`;
            if (messageElement) messageElement.innerHTML = message;
            if (confirmBtn) {
                confirmBtn.textContent = confirmText;
                confirmBtn.className = `btn ${confirmButtonClass}`;
            }

            // Visa modal
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();

            // Hantera svar
            const handleConfirm = () => {
                cleanup();
                resolve(true);
                bsModal.hide();
            };

            const handleCancel = () => {
                cleanup();
                resolve(false);
                bsModal.hide();
            };

            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                modal.removeEventListener('hidden.bs.modal', handleCancel);
            };

            confirmBtn.addEventListener('click', handleConfirm);
            modal.addEventListener('hidden.bs.modal', handleCancel, { once: true });
        });
    }

    // Uppdaterade meddelande-metoder
    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    showWarningMessage(message) {
        this.showToast(message, 'warning');
    }

    showInfoMessage(message) {
        this.showToast(message, 'info');
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

        // Sök-funktionalitet med debounce
        const searchInput = document.getElementById('carSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300); // 300ms delay för bättre prestanda
            });
        }

        // Status-filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.handleStatusFilter(e.target.value);
            });
        }
    }

    // ===== SÖK-FUNKTIONALITET =====
    handleSearch(searchTerm) {
        console.log('🔍 Söker efter:', searchTerm);
        this.applyCurrentFilters();
    }

    // ===== STATUS-FILTER FUNKTIONALITET =====
    handleStatusFilter(selectedStatus) {
        console.log('🚦 Filtrerar på status:', selectedStatus || 'Alla');
        this.applyCurrentFilters();
    }

    applyCurrentFilters() {
        const searchTerm = document.getElementById('carSearch')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        let results = [...this.allCars];
        
        // Applicera sökfilter först (sök genom bilnamn, reg nummer, år, kategori)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            results = results.filter(car => {
                const brand = car.brand?.toLowerCase() || '';
                const model = car.model?.toLowerCase() || '';
                const regNr = car.regNr?.toLowerCase() || '';
                const year = car.year?.toString() || '';
                const category = car.category?.name?.toLowerCase() || '';
                
                return brand.includes(term) || 
                       model.includes(term) || 
                       regNr.includes(term) || 
                       year.includes(term) || 
                       category.includes(term);
            });
        }
        
        // Applicera statusfilter
        if (statusFilter) {
            results = results.filter(car => {
                const carStatus = (car.status || 'ACTIVE').toUpperCase();
                return carStatus === statusFilter.toUpperCase();
            });
        }
        
        this.filteredCars = results;
        this.renderCarsTable(this.filteredCars);
        
        console.log('🎯 Filter applicerat:', this.filteredCars.length, 'av', this.allCars.length, 'bilar visas');
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

    // ===== CAR LOADING =====
    async loadCars() {
        console.log('🚗 Laddar bil-lista...');
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/cars`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const cars = await response.json();
            console.log('✅ Bilar laddade:', cars.length, 'bilar');
            
            // Lagra alla bilar för filtrering
            this.allCars = cars;
            this.filteredCars = [...cars]; // Kopiera alla till filtered först
            
            // Applicera aktuella filter (om några)
            this.applyCurrentFilters();
            
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
                        <i class="bi bi-car-front text-muted fs-2"></i>
                        <p class="mt-2 mb-1 fw-bold">Inga bilar hittades</p>
                        <small class="text-muted">Prova att ändra sök- eller filterinställningar</small>
                    </td>
                </tr>
            `;
            return;
        }

        // Rendera bil-rader med ny struktur
        tableBody.innerHTML = cars.map(car => `
            <tr class="align-middle">
                <td>
                    ${car.imageUrl ? 
                        `<img src="/images/${car.imageUrl}" alt="${car.brand} ${car.model}" 
                             class="rounded" style="width: 60px; height: 40px; object-fit: cover;">` : 
                        `<div class="bg-light rounded d-flex align-items-center justify-content-center" 
                             style="width: 60px; height: 40px;">
                            <i class="bi bi-car-front text-muted"></i>
                         </div>`
                    }
                </td>
                <td>
                    <div class="fw-bold">${car.brand} ${car.model}</div>
                </td>
                <td>
                    <span class="badge bg-light text-dark">${car.regNr}</span>
                </td>
                <td class="fw-medium">${car.year}</td>
                <td>
                    <span class="badge bg-primary bg-opacity-10 text-primary">
                        ${car.category ? car.category.name : 'Okänd'}
                    </span>
                </td>
                <td>
                    <div class="fw-bold text-success">${car.price} kr</div>
                    <small class="text-muted">per dag</small>
                </td>
                <td>
                    ${this.renderStatusBadge(car.status || 'ACTIVE')}
                </td>
                <td>
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-outline-primary btn-sm" 
                                title="Redigera bil" 
                                onclick="adminCarsManager.editCar(${car.id})">
                            <i class="bi bi-pencil me-1"></i>Redigera
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
            return `<span class="badge d-flex align-items-center gap-1" style="background-color: #22c55e; color: white; padding: 8px 12px; border-radius: 8px; font-weight: 500;">
                        <i class="bi bi-check-circle"></i>ACTIVE
                    </span>`;
        } else if (statusUpper === 'INACTIVE') {
            return `<span class="badge d-flex align-items-center gap-1" style="background-color: #ef4444; color: white; padding: 8px 12px; border-radius: 8px; font-weight: 500;">
                        <i class="bi bi-x-circle"></i>INACTIVE
                    </span>`;
        } else {
            return `<span class="badge bg-secondary d-flex align-items-center gap-1" style="padding: 8px 12px; border-radius: 8px;">
                        ${statusUpper}
                    </span>`;
        }
    }

    showErrorInTable(message) {
        const tableBody = document.getElementById('carsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-5">
                    <i class="bi bi-exclamation-triangle fs-2 mb-2"></i>
                    <p class="mt-2 mb-0 fw-bold">${message}</p>
                    <small class="text-muted">Kontrollera att backend-servern körs</small>
                </td>
            </tr>
        `;
    }

    updatePaginationInfo(displayedCars) {
        const paginationInfo = document.getElementById('paginationInfo');
        if (paginationInfo) {
            if (displayedCars === this.allCars.length) {
                paginationInfo.innerHTML = `<i class="bi bi-info-circle me-1"></i>Visar ${displayedCars} av ${this.allCars.length} bilar`;
            } else {
                paginationInfo.innerHTML = `<i class="bi bi-funnel me-1"></i>Visar ${displayedCars} av ${this.allCars.length} bilar (filtrerat)`;
            }
        }
    }

    // ===== MODAL-HANTERING =====
    openAddCarModal() {
        console.log('➕ Öppnar "Lägg till bil"-modal...');
        
        // Sätt modal-titel
        const modalTitle = document.getElementById('carModalTitle');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="bi bi-plus-circle me-2 text-success"></i>Lägg till Bil';
        }

        // Sätt knapp-text
        const saveBtn = document.getElementById('saveCarBtn');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Spara Bil';
        }

        // Dölj status-fält för nya bilar (får automatiskt ACTIVE)
        const statusContainer = document.getElementById('statusFieldContainer');
        if (statusContainer) {
            statusContainer.style.display = 'none';
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
        
        // Dölj status-fält (visas bara vid redigering)
        const statusContainer = document.getElementById('statusFieldContainer');
        if (statusContainer) {
            statusContainer.style.display = 'none';
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
            modalTitle.innerHTML = `<i class="bi bi-pencil me-2 text-primary"></i>Redigera Bil: ${car.brand} ${car.model}`;
        }

        const saveBtn = document.getElementById('saveCarBtn');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Uppdatera Bil';
        }

        // Visa status-fält för redigering
        const statusContainer = document.getElementById('statusFieldContainer');
        if (statusContainer) {
            statusContainer.style.display = 'block';
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
            'carStatus': car.status || 'ACTIVE', // Lägg till status
            'carDescription': '' // Beskrivning finns inte i entiteten än
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value !== undefined && value !== null) {
                field.value = value;
            }
        });

        // Lägg till färgad styling på status-dropdown baserat på vald status
        this.updateStatusDropdownStyling();

        console.log('📝 Formulär fyllt med bil-data (inkl. status:', car.status, ')');
    }

    updateStatusDropdownStyling() {
        const statusSelect = document.getElementById('carStatus');
        if (!statusSelect) return;

        const selectedValue = statusSelect.value;
        
        // Ta bort tidigare styling
        statusSelect.classList.remove('text-success', 'text-danger');
        
        // Lägg till färgad styling baserat på vald status
        if (selectedValue === 'ACTIVE') {
            statusSelect.classList.add('text-success');
            statusSelect.style.fontWeight = 'bold';
        } else if (selectedValue === 'INACTIVE') {
            statusSelect.classList.add('text-danger');
            statusSelect.style.fontWeight = 'bold';
        }

        // Lägg till event listener för att uppdatera styling vid förändring
        statusSelect.removeEventListener('change', this.updateStatusDropdownStyling.bind(this));
        statusSelect.addEventListener('change', this.updateStatusDropdownStyling.bind(this));
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
                successMessage = 'Bil uppdaterad framgångsrikt!';
            } else {
                // CREATE - Skapa ny bil
                response = await fetch(`${this.apiBaseUrl}/cars`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                successMessage = 'Bil tillagd framgångsrikt!';
            }

            const result = await response.json();

            if (response.ok && result.success) {
                // SUCCESS
                console.log('✅ Bil sparad framgångsrikt:', result);
                
                // Visa bekräftelse med toast
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

    collectFormData() {
        const formData = {
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

        // Lägg till status bara vid redigering
        if (this.currentEditingCarId) {
            formData.status = document.getElementById('carStatus')?.value || 'ACTIVE';
        }

        return formData;
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
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sparar...';
        } else {
            saveBtn.disabled = false;
            if (this.currentEditingCarId) {
                saveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Uppdatera Bil';
            } else {
                saveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Spara Bil';
            }
        }
    }

    // Exempel på hur man kan använda bekräftelse-modal för framtida funktioner
    async confirmDeleteCar(carId) {
        const confirmed = await this.showConfirm(
            'Ta bort bil',
            'Är du säker på att du vill ta bort denna bil permanent? <br><strong>Denna åtgärd kan inte ångras.</strong>',
            'Ta bort',
            'btn-danger'
        );

        if (confirmed) {
            console.log('Bil skulle tas bort:', carId);
            this.showSuccessMessage('Bil borttagen!');
        } else {
            console.log('Borttagning avbröts');
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

console.log('📁 admin-cars.js laddad med professionella notifikationer');