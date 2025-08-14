// Default sections and items
let sections = JSON.parse(localStorage.getItem("sections")) || {
    "Alcohol and Spirits": ["Whiskey", "Vodka", "Gin"],
    "Beer and Cider": ["Lager", "Ale", "Cider"],
    "Drinks - Can": ["Coke Can", "Pepsi Can"],
    "Drinks - Bottles": ["Coke Bottle", "Pepsi Bottle"],
    "Drinks - 2L": ["Coke 2L", "Pepsi 2L"],
    "Drinks - Juices": ["Orange Juice", "Apple Juice"],
    "Mineral Water": ["Still Water", "Sparkling Water"],
    "Grocery": ["Rice", "Sugar", "Flour"],
    "Household": ["Detergent", "Toilet Paper"],
    "Chilled Items": ["Milk", "Cheese", "Yogurt"],
    "Crisps": ["Potato Chips", "Corn Chips"],
    "Pet Foods": ["Dog Food", "Cat Food"],
    "Sweets": ["Chocolate", "Candy"]
};

// Store checkbox states
let selectedItems = JSON.parse(localStorage.getItem("selectedItems")) || {};

function saveSections() {
    localStorage.setItem("sections", JSON.stringify(sections));
}

function saveSelectedItems() {
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
}

function renderList() {
    const listDiv = document.getElementById("list");
    listDiv.innerHTML = "";

    for (const section in sections) {
        const h2 = document.createElement("h2");
        h2.textContent = section;

        const addBtn = document.createElement("button");
        addBtn.textContent = "+ Add Item";
        addBtn.onclick = () => addItem(section);
        h2.appendChild(addBtn);
        listDiv.appendChild(h2);

        sections[section].forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "item";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = section + "_" + index;

            // Restore saved selection state
            if (selectedItems[section] && selectedItems[section].includes(index)) {
                checkbox.checked = true;
            }

            // Save state when checkbox changes
            checkbox.addEventListener("change", () => {
                if (!selectedItems[section]) {
                    selectedItems[section] = [];
                }
                if (checkbox.checked) {
                    if (!selectedItems[section].includes(index)) {
                        selectedItems[section].push(index);
                    }
                } else {
                    selectedItems[section] = selectedItems[section].filter(i => i !== index);
                    if (selectedItems[section].length === 0) {
                        delete selectedItems[section];
                    }
                }
                saveSelectedItems();
            });

            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = item;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "×";
            deleteBtn.style.marginLeft = "10px";
            deleteBtn.onclick = () => deleteItem(section, index);

            div.appendChild(checkbox);
            div.appendChild(label);
            div.appendChild(deleteBtn);

            listDiv.appendChild(div);
        });
    }
}

function deleteItem(section, index) {
    if (confirm(`Delete "${sections[section][index]}" from ${section}?`)) {
        sections[section].splice(index, 1);
        saveSections();

        // Also remove from selected items
        if (selectedItems[section]) {
            selectedItems[section] = selectedItems[section].filter(i => i !== index);
            saveSelectedItems();
        }
        renderList();
    }
}

function addItem(section) {
    const newItem = prompt("Enter new item name for " + section + ":");
    if (newItem && newItem.trim()) {
        const name = newItem.trim();
        if (!sections[section].includes(name)) {
            sections[section].push(name);
            saveSections();
            renderList();
        } else {
            alert("Item already exists in this section.");
        }
    }
}

function showSelected() {
    const output = {};
    for (const section in selectedItems) {
        output[section] = selectedItems[section].map(i => sections[section][i]);
    }
    let result = "";
    for (const section in output) {
        result += section + ":\n" + output[section].join("\n") + "\n\n";
    }
    document.getElementById("output").textContent = result || "No items selected.";
}

// --- Backup (export) ---
function exportData() {
    const dataStr = JSON.stringify({ sections, selectedItems }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shop-data.json";
    a.click();
    URL.revokeObjectURL(url);
}

// --- Restore (import) ---
function importData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported && typeof imported === "object" && imported.sections) {
                sections = imported.sections;
                selectedItems = imported.selectedItems || {};
                saveSections();
                saveSelectedItems();
                renderList();
                alert("Data restored successfully!");
            } else {
                alert("Invalid data format. Please select a valid backup JSON.");
            }
        } catch (err) {
            alert("Error reading file: " + err.message);
        } finally {
            event.target.value = "";
        }
    };
    reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
    const importInput = document.getElementById("importFile");
    if (importInput) {
        importInput.addEventListener("change", importData);
    }
    renderList();
});

