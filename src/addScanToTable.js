import { getLatestScanOnScanPark } from "./getLatestScanOnScanPark";

const columnWidth = "170px"

async function addLatestScanColumn() {
  const contentColgroup = document.querySelector("#tabcontent-activeTab > div.k-grid-content.k-auto-scrollable > table > colgroup");
  if (!contentColgroup.querySelector("col[data-custom='latestScan']")) {
    const newContentCol = document.createElement("col");
    newContentCol.setAttribute("data-custom", "latestScan");
    newContentCol.style.width = columnWidth
    contentColgroup.insertBefore(newContentCol, contentColgroup.children[contentColgroup.children.length - 2]);
  }

  const tableRows = document.querySelectorAll("#tabcontent-activeTab tbody tr");

  if (document.querySelector("#tabcontent-activeTab tbody td[data-custom='latestScan']")) {
    return
  }
  // First, create the td cells and append them to each row
  tableRows.forEach(row => {
    const newCell = document.createElement("td");
    newCell.innerHTML = "Loading...";
    // Add a data attribute to the cell to identify it as the latest scan cell
    newCell.setAttribute("data-custom", "latestScan");
    // check if the cell already exists
    if (row.querySelector("td[data-custom='latestScan']")) {
      return
    }
    row.insertBefore(newCell, row.children[row.children.length - 2]);
  });

  // Then, get the barcode data
  const barcodeCells = Array.from(tableRows).map(row => row.querySelector("td:nth-child(3) a").textContent);

  // Fetch the scan data for each barcode
  const scanDataPromises = barcodeCells.map(barcode => getLatestScanOnScanPark("1886" + barcode, true));

  // Populate the cells with the results
  Promise.all(scanDataPromises).then(scanDataResults => {
    scanDataResults.forEach((scanData, index) => {
      const cell = tableRows[index].querySelector("td:nth-last-child(3)");
      cell.innerHTML = scanData
    });
  });
}

function addLatestScanColumnHeader() {
  const headerRow = document.querySelector("#tabcontent-activeTab .k-grid-header .k-grid-header-wrap table thead tr");
  if (!headerRow) {
    console.log("No headerRow found");
    return;
  }
  const newHeader = document.createElement("th");
  newHeader.className = "k-header";

  newHeader.textContent = "Latest Scan";
  headerRow.insertBefore(newHeader, headerRow.children[headerRow.children.length - 2]);

  const colgroup = document.querySelector("#tabcontent-activeTab .k-grid-header .k-grid-header-wrap table colgroup");
  const newCol = document.createElement("col");
  newCol.style.width = columnWidth;

  colgroup.insertBefore(newCol, colgroup.children[colgroup.children.length - 2]);
}

addLatestScanColumnHeader()

// Mutation observer to monitor changes in the DOM and re-run addLatestScanColumn if needed
const targetNode = document.getElementById('tabcontent-activeTab');
if (targetNode) {
  const config = { childList: true, subtree: true };

  // Debounce function to limit how often addLatestScanColumn is called
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedAddLatestScanColumn = debounce(() => addLatestScanColumn(), 50);

  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');
        debouncedAddLatestScanColumn();
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}


