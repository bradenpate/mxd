document.addEventListener("DOMContentLoaded", () => {
    const iconGallery = document.getElementById("icon-gallery");
    const searchInput = document.getElementById("icon-search");
    const categoryFilter = document.getElementById("category-filter");

    let icons = []; // To hold all icons

    // Function to load and display icons
    async function loadIcons() {
        const response = await fetch("./icons-metadata.json");
        const metadata = await response.json();
        icons = metadata.icons; // Save all icons for filtering

        populateCategoryFilter(icons);
        displayIcons(icons);
    }

    // Function to populate the category filter dropdown
    function populateCategoryFilter(iconList) {
        const categories = Array.from(
            new Set(iconList.map(icon => icon.category || "Uncategorized"))
        ).sort(); // Get unique categories and sort them alphabetically

        categoryFilter.innerHTML = `
            <option value="all">All Categories</option>
            ${categories.map(category => `<option value="${category}">${category}</option>`).join("")}
        `;
    }

    // Function to display icons
    function displayIcons(iconList) {
        iconGallery.innerHTML = "";

        iconList.forEach(icon => {
            const iconCard = document.createElement("div");
            iconCard.className = "icon-card";

            iconCard.innerHTML = `
                <h3>${icon.name}</h3>
                <div class="category">${icon.category}</div>
                <div class="icon-card-content">
                    ${
                        icon.filled
                            ? `
                                <div class="icon-column">
                                    <img src="${icon.filled}" alt="${icon.name} (Filled)">
                                    <a href="${icon.filled}" download="${icon.name}-filled.svg">Download Filled</a>
                                </div>
                            `
                            : "<div class='icon-column'><p>Filled version not available</p></div>"
                    }
                    ${
                        icon.lined
                            ? `
                                <div class="icon-column">
                                    <img src="${icon.lined}" alt="${icon.name} (Lined)">
                                    <a href="${icon.lined}" download="${icon.name}-lined.svg">Download Lined</a>
                                </div>
                            `
                            : "<div class='icon-column'><p>Lined version not available</p></div>"
                    }
                </div>
                <p>${icon.description}</p>
            `;

            iconGallery.appendChild(iconCard);
        });
    }

    // Event listener for search input
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterAndDisplayIcons(searchTerm, categoryFilter.value);
    });

    // Event listener for category filter
    categoryFilter.addEventListener("change", (e) => {
        const selectedCategory = e.target.value;
        filterAndDisplayIcons(searchInput.value.toLowerCase(), selectedCategory);
    });

    // Function to filter and display icons based on search and category
    function filterAndDisplayIcons(searchTerm, selectedCategory) {
        const filteredIcons = icons.filter(icon => {
            const matchesSearch = 
                icon.name.toLowerCase().includes(searchTerm) ||
                icon.description.toLowerCase().includes(searchTerm);

            const matchesCategory = 
                selectedCategory === "all" || icon.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        displayIcons(filteredIcons);
    }

    loadIcons(); // Load icons on page load
});