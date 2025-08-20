// Load sections from localStorage or use defaults
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

// Save selections separately
let selectedItems = JSON.parse(localStorage.getItem("selectedItems")) || {};

function saveSections() {
    localStorage.setItem("sections", JSON.stringify(sections));
}

function saveSelections() {
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
}

// Render all sections and items
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
        sections[section].sort((a, b) => a.localeCompare(b));

        sections[section].forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "item";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = section + "_" + index;
            checkbox.checked = selectedItems[section]?.includes(item) || false;
            checkbox.onchange = () => {
                if (!selectedItems[section]) selectedItems[section] = [];
                if (checkbox.checked) {
                    if (!selectedItems[section].includes(item)) {
                        selectedItems[section].push(item);
                    }
                } else {
                    selectedItems[section] = selectedItems[section].filter(i => i !== item);
                }
                saveSelections();
            };

            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = item;

            // ✎ Edit button (small icon)
            const editBtn = document.createElement("button");
            editBtn.textContent = "✎";
            editBtn.style.marginLeft = "10px";
            editBtn.title = "Edit item";
            editBtn.onclick = () => editItem(section, index);

            // × Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "×";
            deleteBtn.style.marginLeft = "5px";
            deleteBtn.title = "Delete item";
            deleteBtn.onclick = () => deleteItem(section, index);

            div.appendChild(checkbox);
            div.appendChild(label);
            div.appendChild(editBtn);
            div.appendChild(deleteBtn);

            listDiv.appendChild(div);
        });
    }
}

function deleteItem(section, index) {
    if (confirm(`Delete "${sections[section][index]}" from ${section}?`)) {
        sections[section].splice(index, 1);
        saveSections();
        renderList();
    }
}

function editItem(section, index) {
    const oldName = sections[section][index];
    const newName = prompt("Edit item name:", oldName);
    if (newName && newName.trim()) {
        sections[section][index] = newName.trim();
        saveSections();

        // Update selections if item was selected
        if (selectedItems[section]) {
            selectedItems[section] = selectedItems[section].map(i =>
                i === oldName ? newName.trim() : i
            );
            saveSelections();
        }

        renderList();
    }
}

function addItem(section) {
    const newItem = prompt("Enter new item name for " + section + ":");
    if (newItem && newItem.trim()) {
        if (!sections[section].includes(newItem.trim())) {
            sections[section].push(newItem.trim());
            saveSections();
            renderList();
        } else {
            alert("Item already exists in this section.");
        }
    }
}

function showSelected() {
    const selected = {};
    for (const section in selectedItems) {
        if (selectedItems[section].length > 0) {
            selected[section] = selectedItems[section];
        }
    }
    let output = "";
    for (const section in selected) {
        output += section + ":\n" + selected[section].join("\n") + "\n\n";
    }
    document.getElementById("output").textContent = output || "No items selected.";
}

// Backup all data
function backupData() {
    const data = {
        sections: sections,
        selectedItems: selectedItems
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "backup.json";
    link.click();
}

// Restore from backup file
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
            saveSelections();
            renderList();
        } catch (err) {
            alert("Invalid backup file");
        }
    };
    reader.readAsText(file);
}

// Export selected items to PDF
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text("Selected Items", 10, y);
    y += 10;

    for (const section in selectedItems) {
        if (selectedItems[section].length > 0) {
            // Section title bold
            doc.setFont(undefined, "bold");
            doc.text(section, 10, y);
            y += 6;

            // Section items
            doc.setFont(undefined, "normal");
            selectedItems[section].forEach(item => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text("- " + item, 15, y);
                y += 6;
            });

            // Space after section
            y += 4;
        }
    }

    doc.save("selected_items.pdf");
}

// Initial render
renderList();
