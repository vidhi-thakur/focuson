// Content script to show blocking confirmation dialog
(function() {
  // Don't run on chrome:// or extension pages
  if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
    return;
  }

  // Check if dialog already exists
  if (document.getElementById('focuson-blocker-dialog')) {
    return;
  }

  // Check with background script if this page should be blocked
  try {
    chrome.runtime.sendMessage({
      type: 'CHECK_SHOULD_BLOCK',
      url: window.location.href
    }, (response) => {
      // Handle Chrome extension API errors
      if (chrome.runtime.lastError) {
        return;
      }
      
      // If response is undefined or shouldn't block, don't show dialog
      if (!response || !response.shouldBlock) {
        return;
      }

      showBlockingDialog();
    });
  } catch (error) {
    // Silently fail if extension context is invalid
    return;
  }

  function showBlockingDialog() {
      // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'focuson-blocker-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    // Create dialog
    const dialog = document.createElement('div');
    dialog.id = 'focuson-blocker-dialog';
    dialog.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      text-align: center;
      z-index: 1000000;
    `;

    // Create title
    const title = document.createElement('h2');
    title.textContent = '⏰ Focus Mode Active';
    title.style.cssText = `
      margin: 0 0 15px 0;
      color: #1976d2;
      font-size: 24px;
    `;

    // Create message
    const message = document.createElement('p');
    message.textContent = 'Do you really want to access this page?';
    message.style.cssText = `
      margin: 0 0 25px 0;
      color: #333;
      font-size: 16px;
      line-height: 1.5;
    `;

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
    `;

    // Create Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Stay Focused';
    cancelBtn.style.cssText = `
      padding: 12px 24px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    `;
    cancelBtn.onmouseover = () => cancelBtn.style.background = '#1565c0';
    cancelBtn.onmouseout = () => cancelBtn.style.background = '#1976d2';
    cancelBtn.onclick = () => {
      // Go back in history
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // If no history, navigate to a safe page
        window.location.href = 'chrome://newtab/';
      }
      overlay.remove();
    };

    // Create Continue button
    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continue Anyway';
    continueBtn.style.cssText = `
      padding: 12px 24px;
      background: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    `;
    continueBtn.onmouseover = () => continueBtn.style.background = '#e0e0e0';
    continueBtn.onmouseout = () => continueBtn.style.background = '#f5f5f5';
    continueBtn.onclick = () => {
      // Send message to background to allow this site temporarily
      chrome.runtime.sendMessage({
        type: 'ALLOW_SITE_TEMPORARILY',
        url: window.location.href
      });
      overlay.remove();
    };

    // Assemble dialog
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(continueBtn);
    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);

    // Wait for DOM to be ready
    const addOverlay = () => {
      if (document.body) {
        document.body.appendChild(overlay);
      } else {
        setTimeout(addOverlay, 10);
      }
    };
    addOverlay();

    // Prevent interaction with page content
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        // Clicking outside closes and goes back
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = 'chrome://newtab/';
        }
        overlay.remove();
      }
    };
  }
})();
