// This simple variable acts as a global guard
let isNavigating = false;

export const NavigationLock = {
  // Check if we are currently locked
  isLocked: () => isNavigating,

  // Lock navigation for a short time (e.g., 1 second)
  lock: () => {
    isNavigating = true;
    // Automatically unlock after 1 second (safety net)
    setTimeout(() => {
      isNavigating = false;
    }, 1000);
  },

  // Force unlock if needed
  unlock: () => {
    isNavigating = false;
  }
};