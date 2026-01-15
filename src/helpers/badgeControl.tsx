// Helper function to update badge on extension icon
const updateBadge = (min: number, sec: number, isRunning: boolean): void => {
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

export { updateBadge, clearBadge };