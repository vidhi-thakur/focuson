// Background service worker for Chrome extension
// Updates the badge with timer countdown and maintains timer state

// Format time as mm:ss
function formatTime(min, sec) {
  const minutes = min.toString().padStart(2, '0');
  const seconds = sec.toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
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
  isRunning: false
};

let timerInterval = null;

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
    
    if (message.isRunning) {
      startTimer();
    } else {
      stopTimer();
      updateBadge(message.min, message.sec, false);
    }
    sendResponse({ success: true });
  } else if (message.type === 'CLEAR_BADGE') {
    stopTimer();
    chrome.action.setBadgeText({ text: '' });
    sendResponse({ success: true });
  } else if (message.type === 'SYNC_STATE') {
    // Popup requesting current state
    sendResponse({
      min: timerState.min,
      sec: timerState.sec,
      isRunning: timerState.isRunning
    });
  }
  return true; // Keep the message channel open for async response
});

// Initialize badge on startup (will be empty until popup syncs)
chrome.action.setBadgeText({ text: '' });

