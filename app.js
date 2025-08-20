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

        // Sort items alphabetically before rendering
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

            // Edit button
            const editBtn = document.createElement("button");
            editBtn.textContent = "✏️";
            editBtn.style.marginLeft = "10px";
            editBtn.onclick = () => editItem(section, index);

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "×";
            deleteBtn.style.marginLeft = "5px";
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
    const currentName = sections[section][index];
    const newName = prompt("Edit item name:", currentName);
    if (newName && newName.trim()) {
        if (!sections[section].includes(newName.trim())) {
            // Update item in sections
            sections[section][index] = newName.trim();

            // Update item if it exists in selectedItems
            if (selectedItems[section]) {
                const pos = selectedItems[section].indexOf(currentName);
                if (pos > -1) {
                    selectedItems[section][pos] = newName.trim();
                    saveSelections();
                }
            }

            saveSections();
            renderList();
        } else {
            alert("Item already exists in this section.");
        }
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

function backupData() {
    const dataStr = JSON.stringify({ sections, selectedItems });
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json";
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
            sections = data.sections || sections;
            selectedItems = data.selectedItems || {};
            saveSections();
            saveSelections();
            renderList();
        } catch (err) {
            alert("Invalid backup file.");
        }
    };
    reader.readAsText(file);
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const lineHeight = 7;

    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Selected Shop Order List", margin, y);
    y += lineHeight * 2;

    for (const section in selectedItems) {
        const selected = selectedItems[section];
        if (selected && selected.length > 0) {
            y += lineHeight;

            if (y + lineHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.text(section, margin, y);
            y += lineHeight;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            selected.forEach(item => {
                if (y + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text("• " + item, margin + 6, y);
                y += lineHeight;
            });
        }
    }

    doc.save("Selected_Order_List.pdf");
}

// Initial render
renderList();
