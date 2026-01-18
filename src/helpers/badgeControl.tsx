// Helper function to update badge on extension icon
const updateBadge = (min: number, sec: number, isRunning: boolean, actionIndex?: number): void => {
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.sendMessage
  ) {
    chrome.runtime
      .sendMessage({
        type: "UPDATE_BADGE",
        min,
        sec,
        isRunning,
        actionIndex: actionIndex !== undefined ? actionIndex : 0,
      })
      .catch(() => {
        console.error("Failed to update badge");
      });
  }
};

// Helper function to clear badge
const clearBadge = (): void => {
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.sendMessage
  ) {
    chrome.runtime
      .sendMessage({
        type: "CLEAR_BADGE",
      })
      .catch(() => {
        console.error("Failed to clear badge");
      });
  }
};

// Helper function to sync blocked URLs with background
export const syncBlockedUrls = (urls: string[]): void => {
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.sendMessage
  ) {
    chrome.runtime
      .sendMessage({
        type: "UPDATE_BLOCKED_URLS",
        urls,
      })
      .catch(() => {
        console.error("Failed to sync blocked URLs");
      });
  }
};

export { updateBadge, clearBadge };