// Helper function to play audio alert
const playAudioAlert = (): void => {
  try {
    // Create audio context for generating a beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the beep sound
    oscillator.frequency.value = 800; // Frequency in Hz (higher = more piercing)
    oscillator.type = 'sine'; // Sine wave for a smooth beep

    // Set volume envelope (fade in/out)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    // Play the beep
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Play a second beep after a short delay for more noticeable alert
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      oscillator2.frequency.value = 800;
      oscillator2.type = 'sine';

      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.5);
    }, 600);
  } catch (error) {
    console.error("Failed to play audio alert:", error);
  }
};

// Helper function to show browser notification
const showBrowserNotification = (title: string, message: string): void => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  // Get icon URL safely
  const getIconUrl = (): string | undefined => {
    try {
      if (
        typeof chrome !== "undefined" &&
        typeof chrome.runtime !== "undefined" &&
        typeof (chrome.runtime as any).getURL === "function"
      ) {
        // Use 'as any' to safely access getURL for TypeScript compatibility
        return (chrome.runtime as any).getURL("assets/FocusOn48px.png");
      }
    } catch (error) {
      console.error("Failed to get icon URL:", error);
    }
    return undefined;
  };

  const iconUrl = getIconUrl();
  const notificationOptions: NotificationOptions = {
    body: message,
    tag: "timer-complete", // Tag to replace previous notifications
    requireInteraction: true,
  };

  if (iconUrl) {
    notificationOptions.icon = iconUrl;
  }

  // Check if permission is already granted
  if (Notification.permission === "granted") {
    new Notification(title, notificationOptions);
  } else if (Notification.permission !== "denied") {
    // Request permission if not yet requested
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, notificationOptions);
      }
    });
  }
};

// Helper function to send notification from background script
const sendBackgroundNotification = (title: string, message: string): void => {
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.sendMessage
  ) {
    chrome.runtime
      .sendMessage({
        type: "SHOW_NOTIFICATION",
        title,
        message,
      })
      .catch(() => {
        console.error("Failed to send notification request");
      });
  }
};

// Main function to trigger all notifications
export const notifyTimerComplete = (timerName?: string): void => {
  const title = "Timer Complete! ⏰";
  const message = timerName 
    ? `${timerName} is complete. Great job staying focused!`
    : "Your timer is complete. Great job staying focused!";

  // Play audio alert
  playAudioAlert();

  // Show browser notification
  showBrowserNotification(title, message);

  // Also send notification request to background script (for when popup is closed)
  sendBackgroundNotification(title, message);
};
