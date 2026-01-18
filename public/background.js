// Background service worker for Chrome extension
// Updates the badge with timer countdown and maintains timer state

// Format time as mm:ss
function formatTime(min, sec) {
  const minutes = min.toString().padStart(2, '0');
  const seconds = sec.toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Show browser notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('assets/FocusOn48px.png'),
    title: title,
    message: message,
    priority: 2, // High priority
    requireInteraction: true
  });
}

// Update badge with timer
function updateBadge(min, sec, isRunning) {
  if (isRunning && (min > 0 || sec > 0)) {
    const timeString = formatTime(min, sec);
    chrome.action.setBadgeText({ text: timeString });
    chrome.action.setBadgeBackgroundColor({ color: '#1976d2' }); // Material-UI primary color
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Timer state
let timerState = {
  min: 0,
  sec: 0,
  isRunning: false,
  actionIndex: 0 // 0 = Pomodoro (25 min), 1 = Short Break, 2 = Long Break
};

let timerInterval = null;

// Blocked URLs
let blockedUrls = [];

// Temporarily allowed URLs (reset when timer stops)
let temporarilyAllowedUrls = new Set();

// Normalize URL for comparison
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    let hostname = urlObj.hostname.toLowerCase();
    // Remove www. prefix
    hostname = hostname.replace(/^www\./, '');
    return hostname;
  } catch (e) {
    // If URL parsing fails, try simple normalization
    let normalized = url.toLowerCase().trim();
    normalized = normalized.replace(/^https?:\/\//, '');
    normalized = normalized.replace(/^www\./, '');
    normalized = normalized.replace(/\/.*$/, '');
    return normalized;
  }
}

// Check if URL should be blocked
function shouldBlockUrl(url) {
  // Only block during 25 min Pomodoro timer (actionIndex === 0)
  if (!timerState.isRunning || timerState.actionIndex !== 0) {
    return false;
  }

  // Check if temporarily allowed
  const normalized = normalizeUrl(url);
  if (temporarilyAllowedUrls.has(normalized)) {
    return false;
  }

  // Check if in blocked list
  return blockedUrls.some(blockedUrl => {
    const blockedNormalized = normalizeUrl(blockedUrl);
    return normalized === blockedNormalized || normalized.endsWith('.' + blockedNormalized);
  });
}

// Start the countdown timer
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  timerInterval = setInterval(() => {
    if (timerState.sec === 0 && timerState.min > 0) {
      timerState.min -= 1;
      timerState.sec = 59;
    } else if (timerState.min === 0 && timerState.sec === 0) {
      // Timer finished
      timerState.isRunning = false;
      clearInterval(timerInterval);
      timerInterval = null;
      updateBadge(0, 0, false);
      // Show notification when timer completes
      showNotification("Timer Complete! ⏰", "Your timer is complete. Great job staying focused!");
    } else {
      timerState.sec -= 1;
    }
    
    if (timerState.isRunning) {
      updateBadge(timerState.min, timerState.sec, true);
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerState.isRunning = false;
  updateBadge(timerState.min, timerState.sec, false);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_BADGE') {
    // Update timer state from popup
    timerState.min = message.min;
    timerState.sec = message.sec;
    timerState.isRunning = message.isRunning;
    timerState.actionIndex = message.actionIndex !== undefined ? message.actionIndex : 0;
    
    if (message.isRunning) {
      startTimer();
    } else {
      stopTimer();
      updateBadge(message.min, message.sec, false);
      // Clear temporarily allowed URLs when timer stops
      temporarilyAllowedUrls.clear();
    }
    sendResponse({ success: true });
  } else if (message.type === 'CLEAR_BADGE') {
    stopTimer();
    chrome.action.setBadgeText({ text: '' });
    // Clear temporarily allowed URLs when timer stops
    temporarilyAllowedUrls.clear();
    sendResponse({ success: true });
  } else if (message.type === 'SYNC_STATE') {
    // Popup requesting current state
    sendResponse({
      min: timerState.min,
      sec: timerState.sec,
      isRunning: timerState.isRunning,
      actionIndex: timerState.actionIndex
    });
  } else if (message.type === 'SHOW_NOTIFICATION') {
    // Show notification from popup
    showNotification(message.title, message.message);
    sendResponse({ success: true });
  } else if (message.type === 'UPDATE_BLOCKED_URLS') {
    // Update blocked URLs from settings
    blockedUrls = message.urls || [];
    saveBlockedUrls();
    sendResponse({ success: true });
  } else if (message.type === 'ALLOW_SITE_TEMPORARILY') {
    // Allow site temporarily (user clicked "Continue Anyway")
    const normalized = normalizeUrl(message.url);
    temporarilyAllowedUrls.add(normalized);
    sendResponse({ success: true });
  } else if (message.type === 'CHECK_SHOULD_BLOCK') {
    // Check if current page should be blocked (from content script)
    const shouldBlock = shouldBlockUrl(message.url || sender.tab?.url || '');
    sendResponse({ shouldBlock });
  }
  return true; // Keep the message channel open for async response
});

// Load blocked URLs from storage on startup
chrome.storage.local.get(['blockedUrls'], (result) => {
  if (result.blockedUrls) {
    blockedUrls = result.blockedUrls;
  }
});

// Save blocked URLs to storage when updated
function saveBlockedUrls() {
  chrome.storage.local.set({ blockedUrls });
}

// Also listen for storage changes (in case popup updates it)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.blockedUrls) {
    blockedUrls = changes.blockedUrls.newValue || [];
  }
});

// Listen for tab updates to check if page should be blocked
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if URL should be blocked
    if (shouldBlockUrl(tab.url)) {
      // Inject blocker script
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['blocker.js']
      }).catch(() => {
        // Ignore errors (e.g., chrome:// pages, extension pages)
      });
    }
  }
});

// Initialize badge on startup (will be empty until popup syncs)
chrome.action.setBadgeText({ text: '' });

