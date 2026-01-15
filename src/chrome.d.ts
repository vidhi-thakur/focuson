// TypeScript declarations for Chrome Extension APIs
// Used for badge updates on extension icon

interface Chrome {
  runtime?: {
    sendMessage: (message: any, callback?: (response: any) => void) => Promise<any>;
    onMessage?: {
      addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void) => void;
    };
  };
  action?: {
    setBadgeText: (details: { text: string }) => void;
    setBadgeBackgroundColor: (details: { color: string }) => void;
    onClicked?: {
      addListener: (callback: () => void) => void;
    };
  };
}

declare const chrome: Chrome | undefined;

