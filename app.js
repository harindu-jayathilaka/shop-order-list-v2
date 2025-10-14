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
let currentVisibleSection = Object.keys(sections)[0];

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
    sections[section].sort((a, b) => a.localeCompare(b)); // Sort alphabetically

    const h2 = document.createElement("h2");
    const sectionName = document.createElement("span");
    sectionName.className = "section-name";
    sectionName.textContent = section;
    h2.appendChild(sectionName);
    h2.id = "section-" + section.replace(/\s+/g, "-");

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
      checkbox.checked = selectedItems[section]?.includes(item) || false;
      checkbox.onchange = () => {
        if (!selectedItems[section]) selectedItems[section] = [];
        if (checkbox.checked) {
          if (!selectedItems[section].includes(item))
            selectedItems[section].push(item);
        } else {
          selectedItems[section] = selectedItems[section].filter(i => i !== item);
          if(selectedItems[section].length === 0){
            delete selectedItems[section];
          }
        }
        saveSelectedItems();
      };

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = item;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑";
      deleteBtn.style.marginLeft = "8px";
      deleteBtn.onclick = () => deleteItem(section, index);

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.style.marginLeft = "6px";
      editBtn.onclick = () => editItem(section, index);

      div.appendChild(checkbox);
      div.appendChild(label);
      div.appendChild(editBtn);
      div.appendChild(deleteBtn);

      listDiv.appendChild(div);
    });
  }
  renderGotoButtons();
}

function editItem(section, index) {
  const oldName = sections[section][index];
  const newName = prompt("Edit item name:", oldName);
  if (newName && newName.trim()) {
    const trimmedName = newName.trim();
    // Prevent duplicate
    if (sections[section].includes(trimmedName) && trimmedName !== oldName) {
      alert("Item already exists in this section.");
      return;
    }
    sections[section][index] = trimmedName;

    // Update selectedItems if oldName was selected
    if (selectedItems[section]) {
      const selectedIndex = selectedItems[section].indexOf(oldName);
      if (selectedIndex !== -1) {
        selectedItems[section][selectedIndex] = trimmedName;
      }
    }

    saveSections();
    saveSelectedItems();
    renderList();
  }
}

function deleteItem(section, index) {
  if (confirm(`Delete "${sections[section][index]}" from ${section}?`)) {
    const itemName = sections[section][index];
    sections[section].splice(index, 1);

    if (selectedItems[section]) {
      selectedItems[section] = selectedItems[section].filter(i => i !== itemName);
      if(selectedItems[section].length === 0){
        delete selectedItems[section];
      }
    }

    saveSections();
    saveSelectedItems();
    renderList();
  }
}

function addItem(section) {
  const newItem = prompt(`Enter new item name for ${section}:`);
  if (newItem && newItem.trim()) {
    const trimmedItem = newItem.trim();
    if (!sections[section].includes(trimmedItem)) {
      sections[section].push(trimmedItem);
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

function scrollToOutput() {
  const output = document.getElementById('output');
  showSelected();
  output.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

function unselectAll() {
  if (confirm("Unselect all items?")) {
    selectedItems = {};
    saveSelectedItems();
    renderList();
  }
}

function backupData() {
  const data = { sections, selectedItems };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shop_order_backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function restoreData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.sections) sections = data.sections;
        if (data.selectedItems) selectedItems = data.selectedItems;
        saveSections();
        saveSelectedItems();
        renderList();
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  for (const section in selectedItems) {
    if (selectedItems[section].length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text(section, 10, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      selectedItems[section].forEach(item => {
        if (y > 280) { 
          doc.addPage(); 
          y = 10; 
        }
        doc.text("- " + item, 14, y);
        y += 7;
      });
      y += 5;
    }
  }

  doc.save("Selected_Items.pdf");
}

// Floating Add Button Logic
window.addEventListener("scroll", () => {
  const sectionsHeadings = document.querySelectorAll("h2");
  let current = currentVisibleSection;
  sectionsHeadings.forEach((heading) => {
    const rect = heading.getBoundingClientRect();
    if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
      current = heading.querySelector(".section-name").textContent;
    }
  });
  currentVisibleSection = current;
});

function addItemToVisibleSection() {
  addItem(currentVisibleSection);
}

// Render "Go To Section" buttons below main controls
function renderGotoButtons() {
  const container = document.getElementById('goto-buttons');
  container.innerHTML = "";
  for (const section of Object.keys(sections)) {
    const btn = document.createElement('button');
    btn.textContent = section;
    btn.title = "Go to " + section;
    btn.onclick = () => {
      const el = document.getElementById("section-" + section.replace(/\s+/g, "-"));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    container.appendChild(btn);
  }
}

// Minimize/Restore Bottom Control Panel
const panel = document.getElementById('bottom-panel');
const toggleBtn = document.getElementById('toggle-panel-btn');

toggleBtn.addEventListener('click', () => {
  panel.classList.toggle('minimized');
  if (panel.classList.contains('minimized')) {
    toggleBtn.textContent = '▼';
    localStorage.setItem('panelMinimized', 'true');
  } else {
    toggleBtn.textContent = '▲';
    localStorage.setItem('panelMinimized', 'false');
  }
});

// Restore panel state on load
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('panelMinimized') === 'true') {
    panel.classList.add('minimized');
    toggleBtn.textContent = '▼';
  }
  renderList();
});
