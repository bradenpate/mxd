document.addEventListener("DOMContentLoaded", () => {
    const iconGallery = document.getElementById("icon-gallery");
    const searchInput = document.getElementById("icon-search");
    const categoryFilter = document.getElementById("category-filter");

    let icons = []; // To hold all icons

    // Utility function to format strings
    function formatString(input) {
        return input
            .replace(/[-/]/g, " ") // Replace "-" and "/" with spaces
            .replace(/\d+/g, "") // Remove numbers
            .trim()
            .toLowerCase()
            .replace(/\b(ai|ui)\b/gi, match => match.toUpperCase()) // Keep "AI" and "UI" uppercase
            .replace(/\b\w/g, char => char.toUpperCase()); // Convert to Title Case for all other words
    }

    // Utility function to remove duplicates from an array
    function removeDuplicates(arr, key) {
        const seen = new Set();
        return arr.filter(item => {
            const uniqueValue = item[key];
            if (seen.has(uniqueValue)) {
                return false;
            }
            seen.add(uniqueValue);
            return true;
        });
    }

    // Function to load and display icons
    async function loadIcons() {
        const response = await fetch("./icons-metadata.json");
        const metadata = await response.json();

        // Format and remove duplicates
        icons = removeDuplicates(
            metadata.icons.map(icon => ({
                ...icon,
                name: formatString(icon.name), // Format name
                category: formatString(icon.category || "Uncategorized"), // Format category
            })),
            "name" // Use "name" as the unique identifier for deduplication
        );

        populateCategoryFilter(icons);
        displayIcons(icons);
    }

    // Function to populate the category filter dropdown
    function populateCategoryFilter(iconList) {
        const categories = Array.from(
            new Set(iconList.map(icon => icon.category || "Uncategorized"))
        ).sort();

        categoryFilter.innerHTML = `
            <option value="all">All Categories</option>
            ${categories.map(category => `<option value="${category}">${category}</option>`).join("")}
        `;
    }

    // Function to display icons grouped by category
    function displayIcons(iconList) {
        const uniqueIcons = Array.from(new Set(iconList.map(JSON.stringify))).map(JSON.parse);
        const categories = Array.from(
            new Set(uniqueIcons.map(icon => icon.category || "Uncategorized"))
        ).sort();

        iconGallery.innerHTML = "";

        categories.forEach(category => {
            // Create a section for each category
            const categorySection = document.createElement("section");
            categorySection.className = "category-section";

            // Add category title
            const categoryTitle = document.createElement("h2");
            categoryTitle.className = "category-title";
            categoryTitle.textContent = category;
            categorySection.appendChild(categoryTitle);

            // Add icons for this category
            const categoryIcons = uniqueIcons.filter(icon => icon.category === category);
            categoryIcons.forEach(icon => {
                const iconCard = document.createElement("div");
                iconCard.className = "icon-card";

                iconCard.innerHTML = `
                    <h3>${icon.name}</h3>
                    <div class="icon-card-content">
                        ${
                            icon.filled
                                ? `
                                    <div class="icon-column">
                                        <div class="type">Fill</div>
                                        <img src="${icon.filled}" alt="${icon.name} (Filled)">
                                        <a href="${icon.filled}" download="${icon.name}-filled.svg">Download</a>
                                    </div>
                                `
                                : "<div class='icon-column'><p>Filled version not available</p></div>"
                        }
                        ${
                            icon.lined
                                ? `
                                    <div class="icon-column">
                                        <div class="type">Lined</div>
                                        <img src="${icon.lined}" alt="${icon.name} (Lined)">
                                        <a href="${icon.lined}" download="${icon.name}-lined.svg">Download</a>
                                    </div>
                                `
                                : "<div class='icon-column'><p>Lined version not available</p></div>"
                        }
                    </div>
                    <div class="description">${icon.description}</div>
                `;

                categorySection.appendChild(iconCard);
            });

            iconGallery.appendChild(categorySection);
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