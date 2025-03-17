import Toast from 'react-native-toast-message';

/**
 * Displays a toast notification.
 * @param message - The message to display.
 * @param type - Toast type: 'success', 'error', or 'info'.
 * @param duration - Duration in milliseconds (default: 3000).
 * @example
 * showToast('Login successful', 'success');
 */
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
  Toast.show({
    type,
    text1: message,
    visibilityTime: duration,
    position: 'bottom', // Adjustable per your UI needs
  });
};