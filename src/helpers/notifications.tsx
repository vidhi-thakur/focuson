// Notification helper functions for timer completion alerts

// Play audio alert using Web Audio API
export const playAudioAlert = (): void => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure beep sound
    oscillator.frequency.value = 800; // Higher pitch
    oscillator.type = 'sine';
    
    // Fade in/out for smoother sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Play three beeps
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Play second beep
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
      
      // Play third beep
      setTimeout(() => {
        const oscillator3 = audioContext.createOscillator();
        const gainNode3 = audioContext.createGain();
        oscillator3.connect(gainNode3);
        gainNode3.connect(audioContext.destination);
        oscillator3.frequency.value = 800;
        oscillator3.type = 'sine';
        gainNode3.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode3.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator3.start(audioContext.currentTime);
        oscillator3.stop(audioContext.currentTime + 0.5);
      }, 600);
    }, 600);
  } catch (error) {
    console.error('Failed to play audio alert:', error);
  }
};

// Show browser notification using Web Notifications API
export const showBrowserNotification = (title: string, message: string): void => {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/assets/FocusOn48px.png',
        badge: '/assets/FocusOn16px.png',
        tag: 'timer-complete',
        requireInteraction: false
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/assets/FocusOn48px.png',
            badge: '/assets/FocusOn16px.png',
            tag: 'timer-complete',
            requireInteraction: false
          });
        }
      });
    }
  }
};

// Main function to trigger timer completion notification
export const notifyTimerComplete = (timerType?: string): void => {
  const timerName = timerType || 'Timer';
  const title = `${timerName} Complete!`;
  const message = 'Time to take a break or move to the next task!';
  
  // Show browser notification
  showBrowserNotification(title, message);
  
  // Play audio alert
  playAudioAlert();
};
