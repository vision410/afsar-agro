let billCounter = localStorage.getItem("lastBillNo")
    ? parseInt(localStorage.getItem("lastBillNo")) + 1
    : 1;

  document.getElementById("billNo").value = billCounter;
  document.getElementById("billDate").value = new Date().toLocaleDateString();

  let items = [];
  let isEditing = false;

  function addItem() {
    const name = document.getElementById("itemName").value;
    const price = parseFloat(document.getElementById("itemPrice").value);
    const qty = parseInt(document.getElementById("itemQty").value);
    if (!name || isNaN(price) || isNaN(qty)) return alert("Fill all item fields.");
    const amount = price * qty;
    items.push({ name, price, qty, amount });
    updateTable();
    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemQty").value = "";
  document.getElementById("itemName").focus(); // ✅ Refocus to itemName for next entry
  }

  function updateTable() {
  const tbody = document.querySelector("#itemTable tbody");
  tbody.innerHTML = "";
  let total = 0;
  let totalQty = 0;

  items.forEach((item, index) => {
    total += item.amount;
    totalQty += item.qty;

    const row = `<tr>
      <td>${item.name}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td>${item.qty}</td>
      <td>₹${item.amount.toFixed(2)}</td>
      <td><button onclick="removeItem(${index})">❌</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });

  document.getElementById("totalAmount").innerText = total.toFixed(2);
  document.getElementById("pTotalItems").innerText = items.length;
  document.getElementById("pTotalQty").innerText = totalQty;
  updateStatus();
}

  function removeItem(index) {
    items.splice(index, 1);
    updateTable();
  }

  function updateStatus() {
    const total = parseFloat(document.getElementById("totalAmount").innerText);
    const paid = parseFloat(document.getElementById("paidAmount").value) || 0;
    const remaining = Math.max(0, total - paid);
    const status = remaining === 0 ? "Paid" : "Unpaid";
    document.getElementById("remaining").innerText = remaining.toFixed(2);
    document.getElementById("status").innerText = status;
  }

 function saveAndPrint() {
  const customerName = document.getElementById("customerName").value;
  const paidAmount = parseFloat(document.getElementById("paidAmount").value) || 0;
  const totalAmount = parseFloat(document.getElementById("totalAmount").innerText.replace(/[^\d.-]/g, '')) || 0;
  const remaining = Math.max(0, totalAmount - paidAmount);
  const status = remaining === 0 ? "Paid" : "Unpaid";
  const billMark = document.getElementById("billMark").checked;

  if (!customerName || items.length === 0) {
    return alert("Fill customer name & add items.");
  }

  const billNo = parseInt(document.getElementById("billNo").value);
  const totalItems = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  const bill = {
    customer: customerName,
    billNo: billNo,
    date: document.getElementById("billDate").value,
    items: items,
    total: totalAmount.toFixed(2),
    paid: paidAmount.toFixed(2),
    remaining: remaining.toFixed(2),
    status: status,
    mark: billMark,
    totalItems: totalItems,
    totalQty: totalQty
  };

  localStorage.setItem(`bill_${billNo}`, JSON.stringify(bill));

  if (!isEditing) {
    localStorage.setItem("lastBillNo", billNo);
    billCounter = billNo + 1;
  }

  // ✅ Set print content
  document.getElementById("pCustomer").innerText = customerName;
  document.getElementById("pBillNo").innerText = billNo;
  document.getElementById("pDate").innerText = bill.date;
  document.getElementById("pTotal").innerText = bill.total;
  document.getElementById("pPaid").innerText = bill.paid;
  document.getElementById("pRemain").innerText = bill.remaining;
  document.getElementById("pStatus").innerText = bill.status;
  document.getElementById("pMark").innerText = billMark ? "Yes" : "No";
  document.getElementById("pTotalItems").innerText = bill.totalItems;
  document.getElementById("pTotalQty").innerText = bill.totalQty;

  const tbody = document.getElementById("pItems");
  tbody.innerHTML = "";
  items.forEach(item => {
    tbody.innerHTML += `<tr><td>${item.name}</td><td>${item.qty}</td><td>₹${item.amount.toFixed(2)}</td></tr>`;
  });

  // ✅ Use hidden iframe to print bill (same on mobile & PC)
  const printContents = document.getElementById("printArea").innerHTML;
  const frame = document.getElementById("printFrame");

  const frameDoc = frame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(`
    <html>
      <head>
        <title>Print Bill</title>
        <style>
          body {
            font-family: sans-serif;
            margin: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
          }
          h3, p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `);
  frameDoc.close();

  // ✅ Trigger print
  frame.contentWindow.focus();
  frame.contentWindow.print();

  // ✅ Reset form after print
  isEditing = false;
  items = [];
  document.getElementById("customerName").value = "";
  document.getElementById("paidAmount").value = "";
  document.getElementById("remaining").innerText = "0";
  document.getElementById("status").innerText = "Unpaid";
  document.getElementById("billMark").checked = false;
  document.getElementById("billNo").value = billCounter;
  document.getElementById("billDate").value = new Date().toLocaleDateString();
  document.getElementById("pTotalItems").innerText = "";
  document.getElementById("pTotalQty").innerText = "";
  updateTable();
}

  function loadBill() {
  const input = document.getElementById("searchInput").value.trim();
  if (!input) return alert("Please enter a bill number or customer name.");
  
  let found = null;

  if (!isNaN(input)) {
    const bill = localStorage.getItem(`bill_${input}`);
    if (bill) found = JSON.parse(bill);
  } else {
    for (let key in localStorage) {
      if (key.startsWith("bill_")) {
        const bill = JSON.parse(localStorage.getItem(key));
        if (bill.customer.toLowerCase().includes(input.toLowerCase())) {
          found = bill;
          break;
        }
      }
    }
  }

  if (!found) return alert("Bill not found.");

  isEditing = true;

  document.getElementById("customerName").value = found.customer;
  document.getElementById("billNo").value = found.billNo;
  document.getElementById("billDate").value = found.date;
  document.getElementById("paidAmount").value = found.paid;
  document.getElementById("remaining").innerText = found.remaining;
  document.getElementById("status").innerText = found.status;
  document.getElementById("billMark").checked = found.mark || false; // ✅ restore checkbox state
  document.getElementById("pTotalItems").innerText = found.totalItems || 0;
document.getElementById("pTotalQty").innerText = found.totalQty || 0;
  items = found.items;

  updateTable();

  const lastSaved = parseInt(localStorage.getItem("lastBillNo") || "0");
  if (found.billNo >= lastSaved) {
    billCounter = found.billNo + 1;
  }
}

function deleteBill() {
  const input = document.getElementById("searchInput").value.trim();
  if (!input) return alert("Enter a bill number to delete.");

  const password = prompt("Enter password to delete bill:");
  if (password !== "7875") return alert("Wrong password!");

  const key = `bill_${input}`;
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    alert(`Bill ${input} deleted successfully.`);
  } else {
    alert("Bill not found.");
  }
}

function deleteAllBills() {
  const password = prompt("Enter password to delete all bills:");
  if (password !== "7875") return alert("Wrong password!");

  let count = 0;
  for (let key in localStorage) {
    if (key.startsWith("bill_")) {
      localStorage.removeItem(key);
      count++;
    }
  }
  localStorage.removeItem("lastBillNo");
  alert(`${count} bill(s) deleted successfully.`);
  location.reload(); // Refresh to reset billCounter
}

function parseDate(dateString) {
  const parts = dateString.split('/');
  // parts[0] is day, parts[1] is month, parts[2] is year
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
}

function filterBills() {
  const fromDateInput = document.getElementById("fromDate").value;
  const toDateInput = document.getElementById("toDate").value;

  // Use the custom parseDate function to handle dd/mm/yyyy format
  const from = parseDate(fromDateInput);
  const to = parseDate(toDateInput);
  const markFilter = document.getElementById("markFilter").value;

  const table = document.getElementById("filteredTable");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  filteredBills = [];

  // Check if dates are valid
  if (!from || !to || isNaN(from) || isNaN(to)) {
    alert("Please select both from and to dates.");
    return;
  }

  for (let key in localStorage) {
    if (key.startsWith("bill_")) {
      const bill = JSON.parse(localStorage.getItem(key));
      const billDate = new Date(bill.date);

      // ✅ Check if bill is within date range
      if (billDate >= from && billDate <= to) {
        // ✅ Apply mark filter logic
        if (markFilter === "marked" && !bill.mark) continue;     // skip if not marked
        if (markFilter === "unmarked" && bill.mark) continue;    // skip if marked

        filteredBills.push(bill);

        const row = `<tr>
          <td>${bill.date}</td>
          <td>${bill.customer}</td>
          <td>₹${bill.remaining}</td>
          <td>${bill.billNo}</td>
        </tr>`;
        tbody.innerHTML += row;
      }
    }
  }

  if (filteredBills.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No bills found in selected range.</td></tr>`;
  }

  table.style.display = "table";
}

function uploadCustomerList() {
  const fileInput = document.getElementById("customerFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    // Split by line or comma
    const names = text.split(/\r?\n|,/).map(name => name.trim()).filter(Boolean);
    
    if (names.length === 0) {
      alert("No customer names found in file.");
      return;
    }

    localStorage.setItem("customerList", JSON.stringify(names));
    alert("Customer list uploaded successfully.");
  };
  reader.readAsText(file);
}

document.getElementById("customerName").addEventListener("input", function () {
  const input = this.value.toLowerCase();
  const datalist = document.getElementById("customerSuggestions");
  datalist.innerHTML = "";

  const names = JSON.parse(localStorage.getItem("customerList") || "[]");

  names
    .filter(name => name.toLowerCase().includes(input))
    .slice(0, 10) // Show top 10 matches
    .forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });
});

function uploadItemList() {
  const fileInput = document.getElementById("itemFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/);
    const itemMap = {};

    lines.forEach(line => {
      const [name, price] = line.split(",");
      if (name && price && !isNaN(price)) {
        itemMap[name.trim()] = parseFloat(price.trim());
      }
    });

    if (Object.keys(itemMap).length === 0) {
      alert("No valid item data found.");
      return;
    }

    localStorage.setItem("itemList", JSON.stringify(itemMap));
    alert("Item list with prices uploaded successfully.");
  };
  reader.readAsText(file);
}

document.getElementById("itemName").addEventListener("input", function () {
  const input = this.value.toLowerCase();
  const datalist = document.getElementById("itemSuggestions");
  datalist.innerHTML = "";

  const itemMap = JSON.parse(localStorage.getItem("itemList") || "{}");

  Object.keys(itemMap)
    .filter(name => name.toLowerCase().includes(input))
    .slice(0, 10)
    .forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });

  // ✅ Auto-fill price if exact match found
  const exactMatch = Object.keys(itemMap).find(name => name.toLowerCase() === input);
  if (exactMatch) {
    document.getElementById("itemPrice").value = itemMap[exactMatch];
  }
});

function autoAddItem() {
  const name = document.getElementById("itemName").value.trim();
  const price = parseFloat(document.getElementById("itemPrice").value);
  const qtyInput = document.getElementById("itemQty");
  const qty = parseInt(qtyInput.value);

  // ✅ Check: item name, price valid, qty between 1–99 (including 01)
  if (
    name &&
    !isNaN(price) &&
    !isNaN(qty) &&
    qty >= 1 &&
    qty <= 99 &&
    qtyInput.value.length === 2
  ) {
    addItem();
  }
}

function exportBackup() {
  const backup = {};
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      backup[key] = localStorage.getItem(key);
    }
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `AFSAR_AGRO_BACKUP_${new Date().toISOString().split("T")[0]}.json`;
  link.click();
}

function importBackup() {
  const fileInput = document.getElementById("backupFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a JSON backup file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);

      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Backup file is not a valid object.");
      }

      let count = 0;
      for (let key in parsed) {
        if (parsed.hasOwnProperty(key)) {
          localStorage.setItem(key, parsed[key]);
          count++;
        }
      }

      alert(`✅ Backup restored (${count} items). Page will now reload.`);
      location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Invalid backup file. Make sure it's a valid AFSAR_AGRO backup.");
    }
  };

  reader.readAsText(file);
}

function showItemSummary() {
  const itemName = document.getElementById("summaryItemName").value.trim().toLowerCase();
  if (!itemName) return alert("Please enter an item name.");

  let totalQty = 0;
  let totalAmount = 0;

  for (let key in localStorage) {
    if (key.startsWith("bill_")) {
      const bill = JSON.parse(localStorage.getItem(key));
      bill.items.forEach(item => {
        if (item.name.toLowerCase() === itemName) {
          totalQty += item.qty;
          totalAmount += item.amount;
        }
      });
    }
  }

  const resultDiv = document.getElementById("itemSummaryResult");

  if (totalQty === 0) {
    resultDiv.innerHTML = `No sales found for "<strong>${itemName}</strong>".`;
  } else {
    resultDiv.innerHTML = `
      📦 Total quantity sold for "<strong>${itemName}</strong>": <strong>${totalQty}</strong><br>
      💰 Total amount: ₹<strong>${totalAmount.toFixed(2)}</strong>
    `;
  }
}

function clearItemSummary() {
  document.getElementById("summaryItemName").value = "";
  document.getElementById("itemSummaryResult").innerHTML = "";
}

 function clearForm() {
document.getElementById("itemName").value = "";
document.getElementById("itemPrice").value = "";
document.getElementById("itemQty").value = "";
  document.getElementById("itemName").focus(); // ✅ Refocus to itemName for next entry
document.getElementById("paidAmount").value = "";
document.getElementById("remaining").innerText = "0";
document.getElementById("status").innerText = "Unpaid";
document.getElementById("totalAmount").innerText = "0";
document.getElementById("pTotalItems").innerText = "";
document.getElementById("pTotalQty").innerText = "";
items = [];
updateTable();
        }

        // Add event listener to the clear button
        document.getElementById("clearButton").addEventListener("click", function() {
            // Ask for password before clearing
            var password = prompt("Please enter password to clear the form:");
            
            // Check if the password is correct
            if (password === "7875") {
                clearForm();
                alert("Form cleared successfully.");
            } else {
                alert("Incorrect password.");
            }
        });
        
function exportBillsToExcel() {
  const from = new Date(document.getElementById("fromDate").value);
  const to = new Date(document.getElementById("toDate").value);
  const markFilter = document.getElementById("markFilter").value;

  if (isNaN(from) || isNaN(to)) {
    alert("Please select valid 'From' and 'To' dates.");
    return;
  }

  const data = [];

  for (let key in localStorage) {
    if (key.startsWith("bill_")) {
      const bill = JSON.parse(localStorage.getItem(key));
      const billDate = new Date(bill.date);

      if (billDate >= from && billDate <= to) {
        if (markFilter === "marked" && !bill.mark) continue;
        if (markFilter === "unmarked" && bill.mark) continue;

        bill.items.forEach(item => {
          data.push({
            "Date": bill.date,
            "Bill No": bill.billNo,
            "Customer": bill.customer,
            "Item": item.name,
            "Price": item.price,
            "Qty": item.qty,
            "Amount": item.amount,
            "Total": bill.total,
            "Paid": bill.paid,
            "Remaining": bill.remaining,
            "Status": bill.status,
            "Marked": bill.mark ? "Yes" : "No"
          });
        });
      }
    }
  }

  if (data.length === 0) {
    alert("No bills found for selected filter.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");

  XLSX.writeFile(workbook, `AFSAR_AGRO_BILLS_${new Date().toISOString().split("T")[0]}.xlsx`);
}


  function downloadXML() {
  const from = new Date(document.getElementById("fromDate").value);
  const to = new Date(document.getElementById("toDate").value);
  const markFilter = document.getElementById("markFilter").value;

  if (isNaN(from) || isNaN(to)) {
    alert("Please select both 'From' and 'To' dates.");
    return;
  }

  let bills = [];

  for (let key in localStorage) {
    if (key.startsWith("bill_")) {
      const bill = JSON.parse(localStorage.getItem(key));
      const billDate = new Date(bill.date);

      if (billDate >= from && billDate <= to) {
        if (markFilter === "marked" && !bill.mark) continue;
        if (markFilter === "unmarked" && bill.mark) continue;

        bills.push(bill);
      }
    }
  }

  if (bills.length === 0) {
    alert("No bills found in the selected range.");
    return;
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<bills>\n`;
  bills.forEach(bill => {
    xml += `  <bill>\n`;
    xml += `    <billNo>${bill.billNo}</billNo>\n`;
    xml += `    <customer>${bill.customer}</customer>\n`;
    xml += `    <date>${bill.date}</date>\n`;
    xml += `    <total>${bill.total}</total>\n`;
    xml += `    <paid>${bill.paid}</paid>\n`;
    xml += `    <remaining>${bill.remaining}</remaining>\n`;
    xml += `    <status>${bill.status}</status>\n`;
    xml += `    <mark>${bill.mark}</mark>\n`;
    xml += `    <items>\n`;
    bill.items.forEach(item => {
      xml += `      <item>\n`;
      xml += `        <name>${item.name}</name>\n`;
      xml += `        <price>${item.price}</price>\n`;
      xml += `        <qty>${item.qty}</qty>\n`;
      xml += `        <amount>${item.amount}</amount>\n`;
      xml += `      </item>\n`;
    });
    xml += `    </items>\n`;
    xml += `  </bill>\n`;
  });
  xml += `</bills>`;

  const blob = new Blob([xml], { type: "application/xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `AFSAR_AGRO_BILLS_${new Date().toISOString().split("T")[0]}.xml`;
  link.click();
}

// Check if the browser supports Service Workers
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("service-worker.js")
      .then(res => console.log("✅ Service Worker registered"))
      .catch(err => console.error("❌ Service Worker error:", err));
  });
}


// ✅ Focus on item name after customer selection
document.getElementById("customerName").addEventListener("change", function () {
  document.getElementById("itemName").focus();
});

// ✅ Modify itemName event listener to focus on qty after match
document.getElementById("itemName").addEventListener("input", function () {
  const input = this.value.toLowerCase();
  const datalist = document.getElementById("itemSuggestions");
  datalist.innerHTML = "";

  const itemMap = JSON.parse(localStorage.getItem("itemList") || "{}");

  Object.keys(itemMap)
    .filter(name => name.toLowerCase().includes(input))
    .slice(0, 10)
    .forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });

  const exactMatch = Object.keys(itemMap).find(name => name.toLowerCase() === input);
  if (exactMatch) {
    document.getElementById("itemPrice").value = itemMap[exactMatch];
    document.getElementById("itemQty").focus(); // ✅ Focus to Qty
  }
});
