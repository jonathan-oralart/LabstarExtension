(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/addLastScanLinkToCasePopup.js.b9fd0122.js")
    );
  })().catch(console.error);

})();
