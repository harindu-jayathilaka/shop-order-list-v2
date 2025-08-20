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

// Track selected items (with persistence)
let selectedItems = JSON.parse(localStorage.getItem("selectedItems")) || {};

function saveSections() {
    localStorage.setItem("sections", JSON.stringify(sections));
}

function saveSelections() {
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

        // Sort items alphabetically
        sections[section].sort((a, b) => a.localeCompare(b));

        sections[section].forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "item";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = section + "_" + index;
            checkbox.checked = selectedItems[section]?.includes(item) || false;
            checkbox.onchange = () => toggleSelection(section, item, checkbox.checked);

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

function toggleSelection(section, item, isChecked) {
    if (!selectedItems[section]) selectedItems[section] = [];
    if (isChecked) {
        if (!selectedItems[section].includes(item)) {
            selectedItems[section].push(item);
        }
    } else {
        selectedItems[section] = selectedItems[section].filter(i => i !== item);
    }
    saveSelections();
}

function deleteItem(section, index) {
    if (confirm(`Delete "${sections[section][index]}" from ${section}?`)) {
        const removed = sections[section][index];
        sections[section].splice(index, 1);

        // Also remove from selectedItems
        if (selectedItems[section]) {
            selectedItems[section] = selectedItems[section].filter(i => i !== removed);
        }

        saveSections();
        saveSelections();
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
    let output = "";
    for (const section in selectedItems) {
        if (selectedItems[section].length > 0) {
            output += section + ":\n" + selectedItems[section].join("\n") + "\n\n";
        }
    }
    document.getElementById("output").textContent = output || "No items selected.";
}

// Backup & Restore
function backupData() {
    const dataStr = JSON.stringify({ sections, selectedItems });
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "shop_order_backup.json";
    a.click();

    URL.revokeObjectURL(url);
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.sections) sections = data.sections;
            if (data.selectedItems) selectedItems = data.selectedItems;
            saveSections();
            saveSelections();
            renderList();
            alert("Data restored successfully!");
        } catch {
            alert("Invalid backup file.");
        }
    };
    reader.readAsText(file);
}

// Export PDF with multi-page support
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 8;

    let y = margin;

    doc.setFontSize(14);
    doc.text("Selected Shop Order List", margin, y);
    y += lineHeight * 2;

    for (const section in selectedItems) {
        const selected = selectedItems[section];
        if (selected && selected.length > 0) {
            doc.setFontSize(12);
            if (y + lineHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(section + ":", margin, y);
            y += lineHeight;

            doc.setFontSize(10);
            const textLines = doc.splitTextToSize(selected.join(", "), 180);
            textLines.forEach(line => {
                if (y + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin + 10, y);
                y += lineHeight;
            });

            y += lineHeight;
        }
    }

    doc.save("Selected_Order_List.pdf");
}

// Initial render
renderList();
