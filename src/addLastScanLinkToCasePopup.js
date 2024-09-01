import { getLatestScanOnScanPark } from "./getLatestScanOnScanPark";

async function addLastScanLinkToCasePopup() {
  const barcode = document.querySelector(".App-header div.col-1 > span:nth-child(2) > strong")?.innerText;
  const barCodeAllNumbers = /^\d+$/.test(barcode);
  if (barcode === null || barcode?.length !== 8 || !barCodeAllNumbers) {
    return;
  }
  clearInterval(waitForBarcodeAndRun);

  // Header div that we will insert the last scan location link
  const insertLocation = document.querySelector(".App-header .col-1");
  if (insertLocation === null) {
    return;
  }

  // If the link already exists, don't add another one
  if (insertLocation.querySelector("#latestScanLink")) {
    return;
  }

  const scanLink = await getLatestScanOnScanPark(barcode);


  if (scanLink) {
    const e = document.createElement("span");
    e.innerHTML = scanLink; // scanLink is already an HTML string
    e.id = "latestScanLink";
    e.style.paddingRight = "10px";
    insertLocation.append(e);
  }
}
const waitForBarcodeAndRun = setInterval(() => {
  addLastScanLinkToCasePopup();
}, 100);
