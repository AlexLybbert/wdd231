import { initMobileMenu } from './modules/navigation.js';
import { storage } from './modules/storage.js';

let vendorsData = [];
let filteredVendors = [];

let activeFilters = {
    search: '',
    categories: [],
    sustainability: []
};

document.addEventListener('DOMContentLoaded', async () => {
    initMobileMenu();
    initFilters();
    initSort();
    initModal();
    await loadVendors();
    loadSavedFilters();
});

async function loadVendors() {
    const vendorGrid = document.getElementById('vendorGrid');

    try {
        const response = await fetch('data/vendors.json');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        vendorsData = await response.json();
        filteredVendors = [...vendorsData];
        filterAndRenderVendors();
    } catch (error) {
        console.error('Error loading vendor data:', error);

        if (vendorGrid) {
            vendorGrid.innerHTML = `
                <article class="vendor-card">
                    <h3>Unable to load vendor data</h3>
                    <p>Please refresh the page and try again.</p>
                </article>
            `;
        }
    }
}

function initFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const sustainabilityCheckboxes = document.querySelectorAll('input[name="sustainability"]');
    const resetButton = document.getElementById('resetFilters');
    const clearButton = document.getElementById('clearSearch');

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            activeFilters.search = event.target.value.toLowerCase();
            filterAndRenderVendors();
            saveFilters();
        });
    }

    categoryCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            if (checkbox.value === 'all') {
                if (checkbox.checked) {
                    categoryCheckboxes.forEach((item) => {
                        if (item.value !== 'all') {
                            item.checked = false;
                        }
                    });
                    activeFilters.categories = [];
                }
            } else {
                const allCheckbox = document.querySelector('input[name="category"][value="all"]');
                if (allCheckbox) {
                    allCheckbox.checked = false;
                }
                updateCategoryFilters();
            }

            filterAndRenderVendors();
            saveFilters();
        });
    });

    sustainabilityCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            updateSustainabilityFilters();
            filterAndRenderVendors();
            saveFilters();
        });
    });

    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    if (clearButton) {
        clearButton.addEventListener('click', resetFilters);
    }
}

function updateCategoryFilters() {
    activeFilters.categories = Array.from(
        document.querySelectorAll('input[name="category"]:checked:not([value="all"])')
    ).map((checkbox) => checkbox.value);
}

function updateSustainabilityFilters() {
    activeFilters.sustainability = Array.from(
        document.querySelectorAll('input[name="sustainability"]:checked')
    ).map((checkbox) => checkbox.value);
}

function initSort() {
    const sortSelect = document.getElementById('sortSelect');

    if (sortSelect) {
        sortSelect.addEventListener('change', (event) => {
            sortVendors(event.target.value);
            renderVendors(filteredVendors);
        });
    }
}

function sortVendors(sortBy) {
    if (sortBy === 'name') {
        filteredVendors.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
        filteredVendors.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === 'distance') {
        filteredVendors.sort((a, b) => a.distance - b.distance);
    }
}

function filterAndRenderVendors() {
    filteredVendors = vendorsData.filter((vendor) => {
        const matchesSearch =
            activeFilters.search === '' ||
            vendor.name.toLowerCase().includes(activeFilters.search) ||
            vendor.description.toLowerCase().includes(activeFilters.search) ||
            vendor.city.toLowerCase().includes(activeFilters.search);

        const matchesCategory =
            activeFilters.categories.length === 0 ||
            activeFilters.categories.includes(vendor.category);

        const matchesSustainability = activeFilters.sustainability.every((filter) =>
            vendor.sustainability.includes(filter)
        );

        return matchesSearch && matchesCategory && matchesSustainability;
    });

    const sortSelect = document.getElementById('sortSelect');
    const sortValue = sortSelect ? sortSelect.value : 'name';
    sortVendors(sortValue);

    renderVendors(filteredVendors);
}

function renderVendors(vendors) {
    const vendorGrid = document.getElementById('vendorGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');

    if (!vendorGrid || !resultsCount || !noResults) {
        return;
    }

    resultsCount.textContent = String(vendors.length);

    if (vendors.length === 0) {
        vendorGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    const vendorCards = vendors
        .map((vendor, index) => {
            const sustainabilityHtml = vendor.sustainability
                .map((tag) => {
                    const icons = {
                        local: '🌍',
                        organic: '🌿',
                        seasonal: '🍂',
                        'zero-waste': '♻️'
                    };

                    const label = tag.charAt(0).toUpperCase() + tag.slice(1);
                    return `<span class="tag">${icons[tag]} ${label}</span>`;
                })
                .join('');

            return `
                <article class="vendor-card" style="animation-delay: ${index * 0.08}s">
                    <img
                        class="vendor-image"
                        src="${vendor.image}"
                        loading="lazy"
                        width="320"
                        height="180"
                        alt="Food display for ${vendor.name}"
                    >
                    <div class="vendor-header">
                        <h3 class="vendor-name">${vendor.name}</h3>
                        <span class="vendor-category">${formatCategory(vendor.category)}</span>
                    </div>
                    <div class="vendor-info">
                        <p>📍 ${vendor.address}, ${vendor.city}, ${vendor.state} ${vendor.zip}</p>
                        <p>📞 ${vendor.phone}</p>
                        <p>🕒 ${vendor.hours}</p>
                        ${vendor.website ? `<p>🌐 <a href="${vendor.website}" target="_blank" rel="noopener">Visit Website</a></p>` : ''}
                        <p>📏 ${vendor.distance} miles away</p>
                    </div>
                    <p>${vendor.description}</p>
                    <div class="sustainability-tags">${sustainabilityHtml}</div>
                    <button class="cta-button details-btn" type="button" data-vendor-id="${vendor.id}">View details</button>
                </article>
            `;
        })
        .join('');

    vendorGrid.innerHTML = vendorCards;

    vendorGrid.querySelectorAll('.details-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.vendorId);
            const vendor = vendorsData.find((item) => item.id === id);
            if (vendor) {
                openModal(vendor);
            }
        });
    });
}

function formatCategory(category) {
    const categories = {
        'farmers-market': "Farmers' Market",
        csa: 'CSA Program',
        coop: 'Food Co-op',
        restaurant: 'Restaurant'
    };

    return categories[category] || category;
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    document.querySelectorAll('input[name="category"]').forEach((checkbox) => {
        checkbox.checked = checkbox.value === 'all';
    });

    document.querySelectorAll('input[name="sustainability"]').forEach((checkbox) => {
        checkbox.checked = false;
    });

    activeFilters = {
        search: '',
        categories: [],
        sustainability: []
    };

    filterAndRenderVendors();
    saveFilters();
}

function saveFilters() {
    storage.set('foodstead_filters', activeFilters);
}

function loadSavedFilters() {
    const saved = storage.get('foodstead_filters');
    if (!saved) {
        return;
    }

    if (saved.search) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = saved.search;
        }
        activeFilters.search = saved.search;
    }

    if (saved.categories && saved.categories.length > 0) {
        const allCheckbox = document.querySelector('input[name="category"][value="all"]');
        if (allCheckbox) {
            allCheckbox.checked = false;
        }

        saved.categories.forEach((category) => {
            const checkbox = document.querySelector(`input[name="category"][value="${category}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        activeFilters.categories = saved.categories;
    }

    if (saved.sustainability && saved.sustainability.length > 0) {
        saved.sustainability.forEach((tag) => {
            const checkbox = document.querySelector(`input[name="sustainability"][value="${tag}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        activeFilters.sustainability = saved.sustainability;
    }

    filterAndRenderVendors();
}

function initModal() {
    const modal = document.getElementById('vendorModal');
    const closeButton = document.getElementById('closeModal');

    if (!modal || !closeButton) {
        return;
    }

    closeButton.addEventListener('click', () => {
        modal.close();
    });

    modal.addEventListener('click', (event) => {
        const bounds = modal.getBoundingClientRect();
        const outside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;

        if (outside) {
            modal.close();
        }
    });
}

function openModal(vendor) {
    const modal = document.getElementById('vendorModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!modal || !modalTitle || !modalBody) {
        return;
    }

    modalTitle.textContent = vendor.name;
    modalBody.innerHTML = `
        <p><strong>Category:</strong> ${formatCategory(vendor.category)}</p>
        <p><strong>Location:</strong> ${vendor.address}, ${vendor.city}, ${vendor.state} ${vendor.zip}</p>
        <p><strong>Hours:</strong> ${vendor.hours}</p>
        <p><strong>Phone:</strong> ${vendor.phone}</p>
        <p><strong>Distance:</strong> ${vendor.distance} miles</p>
        <p><strong>Description:</strong> ${vendor.description}</p>
    `;

    modal.showModal();
}
