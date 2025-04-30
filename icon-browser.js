document.addEventListener("DOMContentLoaded", () => {
    const iconGallery = document.getElementById("icon-gallery");
    const searchInput = document.getElementById("icon-search");
    const categoryFilter = document.getElementById("category-filter");

    let icons = []; // Array to store all icons.

    // Utility to format strings
    function formatString(input) {
        return input
            .replace(/[-/]/g, " ") // Replace "-" and "/" with spaces
            .replace(/\d+/g, "") // Remove numbers
            .trim()
            .toLowerCase()
            .replace(/\b(ai|ui)\b/gi, match => match.toUpperCase()) // Capitalize AI/UI
            .replace(/\b\w/g, char => char.toUpperCase()); // Title Case
    }

    // Fetch and display icons
    async function loadIcons() {
        try {
            console.log("Loading icons...");
            const response = await fetch("./icons-metadata-copy.json");
            if (!response.ok) throw new Error(`Failed to load icons metadata. Status: ${response.status}`);
            const metadata = await response.json();
            console.log("Icons metadata loaded:", metadata);

            // Deduplicate and format icons
            icons = metadata.icons.map(icon => ({
                ...icon,
                name: formatString(icon.name),
                category: formatString(icon.category || "Uncategorized"),
                filled: `./images/icons/filled/${icon.filled}`,
                lined: `./images/icons/lined/${icon.lined}`,
            }));

            console.log("Formatted icons:", icons);
            populateCategoryFilter(icons);
            displayIcons(icons);
        } catch (error) {
            console.error("Error loading icons:", error);
        }
    }

    // Populate the category dropdown
    function populateCategoryFilter(iconList) {
        const categories = Array.from(new Set(iconList.map(icon => icon.category || "Uncategorized"))).sort();
        categoryFilter.innerHTML = `<option value="all">All Categories</option>` +
            categories.map(category => `<option value="${category}">${category}</option>`).join("");
    }

    // Display icons by category
    function displayIcons(iconList) {
        const categories = Array.from(new Set(iconList.map(icon => icon.category || "Uncategorized"))).sort();
        iconGallery.innerHTML = "";

        categories.forEach(category => {
            const categorySection = document.createElement("section");
            categorySection.className = "category-section";

            const categoryTitle = document.createElement("h2");
            categoryTitle.className = "category-title";
            categoryTitle.textContent = category;
            categorySection.appendChild(categoryTitle);

            const categoryIcons = iconList.filter(icon => icon.category === category);
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
                                        <button class="download-button" data-url="${icon.filled}" data-name="${icon.name}" data-color="#ffffff">White</button>
                                        <button class="download-button" data-url="${icon.filled}" data-name="${icon.name}" data-color="#146FF4">Blue</button>
                                        <button class="download-button" data-url="${icon.filled}" data-name="${icon.name}" data-color="#0A1324">Black</button>
                                    </div>
                                `
                                : "<p>Filled version not available</p>"
                        }
                        ${
                            icon.lined
                                ? `
                                    <div class="icon-column">
                                        <div class="type">Lined</div>
                                        <img src="${icon.lined}" alt="${icon.name} (Lined)">
                                        <button class="download-button" data-url="${icon.lined}" data-name="${icon.name}" data-color="#ffffff">White</button>
                                        <button class="download-button" data-url="${icon.lined}" data-name="${icon.name}" data-color="#146FF4">Blue</button>
                                        <button class="download-button" data-url="${icon.lined}" data-name="${icon.name}" data-color="#0A1324">Black</button>
                                    </div>
                                `
                                : "<p>Lined version not available</p>"
                        }
                    </div>
                `;
                categorySection.appendChild(iconCard);
            });
            iconGallery.appendChild(categorySection);
        });

        // Attach event listeners to download buttons
        document.querySelectorAll(".download-button").forEach(button => {
            button.addEventListener("click", () => {
                const url = button.getAttribute("data-url");
                const name = button.getAttribute("data-name");
                const color = button.getAttribute("data-color");
                downloadIcon(url, name, color);
            });
        });
    }

    // Download an icon in a specific color
    async function downloadIcon(url, name, color) {
        try {
            console.log(`Downloading icon from: ${url}, Name: ${name}, Color: ${color}`);
            
            // Fetch the SVG content
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch SVG at ${url} - Status: ${response.status}`);
            }
            
            const svgText = await response.text();
            console.log("Fetched SVG content successfully.");

            // Parse the SVG
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
            const svgElement = svgDoc.querySelector("svg");

            if (!svgElement) {
                throw new Error("Invalid SVG format: <svg> tag not found.");
            }

            // Modify the fill color or add it if missing
            svgElement.querySelectorAll("path, rect, circle, polygon, polyline, line, text").forEach(el => {
                const currentFill = el.getAttribute("fill");
                if (!currentFill || currentFill === "none") {
                    // Add fill if it is missing or explicitly set to "none"
                    el.setAttribute("fill", color);
                } else {
                    // Replace existing fill color
                    el.setAttribute("fill", color);
                }
            });
            console.log("Updated SVG fill colors.");

            // Serialize the updated SVG
            const serializer = new XMLSerializer();
            const updatedSVG = serializer.serializeToString(svgElement);

            // Create a Blob for download
            const blob = new Blob([updatedSVG], { type: "image/svg+xml;charset=utf-8" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${name}-${color.replace("#", "")}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log("Download triggered successfully.");
        } catch (error) {
            console.error("Error during downloadIcon execution:", error);
        }
    }

    // Search and filter icons
    function filterAndDisplayIcons(searchTerm, selectedCategory) {
        const filteredIcons = icons.filter(icon => {
            const matchesSearch = icon.name.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === "all" || icon.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
        displayIcons(filteredIcons);
    }

    searchInput.addEventListener("input", () => filterAndDisplayIcons(searchInput.value.toLowerCase(), categoryFilter.value));
    categoryFilter.addEventListener("change", () => filterAndDisplayIcons(searchInput.value.toLowerCase(), categoryFilter.value));

    loadIcons();
});