// Load sections from localStorage or default
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

// Track selected items
let selectedItems = JSON.parse(localStorage.getItem("selectedItems")) || {};

function saveSections() {
    localStorage.setItem("sections", JSON.stringify(sections));
}

function saveSelectedItems() {
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
}

function updateSelected(section, item, isChecked) {
    if (!selectedItems[section]) selectedItems[section] = [];
    if (isChecked) {
        if (!selectedItems[section].includes(item)) {
            selectedItems[section].push(item);
        }
    } else {
        selectedItems[section] = selectedItems[section].filter(i => i !== item);
    }
    saveSelectedItems();
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

        // Sort items alphabetically
        const sortedItems = [...sections[section]].sort((a, b) => a.localeCompare(b));

        sortedItems.forEach(item => {
            const div = document.createElement("div");
            div.className = "item";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = section + "_" + item;
            checkbox.checked = selectedItems[section]?.includes(item) || false;
            checkbox.onchange = () => updateSelected(section, item, checkbox.checked);

            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = item;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "×";
            deleteBtn.style.marginLeft = "10px";
            deleteBtn.onclick = () => deleteItem(section, item);

            div.appendChild(checkbox);
            div.appendChild(label);
            div.appendChild(deleteBtn);

            listDiv.appendChild(div);
        });
    }
}

function deleteItem(section, item) {
    if (confirm(`Delete "${item}" from ${section}?`)) {
        sections[section] = sections[section].filter(i => i !== item);
        saveSections();
        renderList();
    }
}

function addItem(section) {
    const newItem = prompt("Enter new item name for " + section + ":");
    if (newItem && newItem.trim()) {
        const trimmed = newItem.trim();
        if (!sections[section].includes(trimmed)) {
            sections[section].push(trimmed);
            sections[section].sort((a, b) => a.localeCompare(b));
            saveSections();
            renderList();
        } else {
            alert("Item already exists in this section.");
        }
    }
}

function showSelected() {
    let output = "";
    for (const section in selectedItems) {
        if (selectedItems[section].length > 0) {
            const sorted = [...selectedItems[section]].sort((a, b) => a.localeCompare(b));
            output += section + ":\n" + sorted.join("\n") + "\n\n";
        }
    }
    document.getElementById("output").textContent = output || "No items selected.";
}

// Backup and Restore
function backupData() {
    const dataStr = JSON.stringify({ sections, selectedItems });
    const blob = new Blob([dataStr], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "shop_order_backup.json";
    a.click();
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            sections = data.sections || sections;
            selectedItems = data.selectedItems || {};
            saveSections();
            saveSelectedItems();
            renderList();
            alert("Data restored successfully!");
        } catch {
            alert("Invalid backup file.");
        }
    };
    reader.readAsText(file);
}

// Export to PDF
function exportPDF() {
    let output = "";
    for (const section in selectedItems) {
        if (selectedItems[section].length > 0) {
            const sorted = [...selectedItems[section]].sort((a, b) => a.localeCompare(b));
            output += section + ":\n" + sorted.join("\n") + "\n\n";
        }
    }
    if (!output) {
        alert("No selected items to export.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(output, 10, 10);
    doc.save("selected_items.pdf");
}

// Initial render
renderList();
