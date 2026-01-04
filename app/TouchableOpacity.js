import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, Platform, Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NavigationLock } from '@/utils/NavigationLock';

export const TouchableOpacity = ({ 
  onPress, 
  children, 
  navigate = false, 
  haptic = 'Light', // Default to Light vibration. Options: 'Light', 'Medium', 'Heavy', 'Selection', 'None'
  ...props 
}) => {

  const handlePress = async (e) => {
    if (!onPress) return;

    // 1. NAVIGATION LOCK LOGIC
    if (navigate) {
      if (NavigationLock.isLocked()) {
        console.log("Navigation blocked: Already navigating");
        return; 
      }
      NavigationLock.lock();
      Keyboard.dismiss();
    }

    // 2. HAPTIC FEEDBACK LOGIC (Run this INDEPENDENTLY of navigation)
    if (Platform.OS !== 'web' && haptic !== 'None') {
        try {
            switch (haptic) {
                case 'Light':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case 'Medium':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'Heavy':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                case 'Selection':
                    // "Selection" is that tiny tick feeling (perfect for counters)
                    await Haptics.selectionAsync(); 
                    break;
                default:
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        } catch (error) {
            console.warn("Haptics not supported or failed");
        }
    }

    // 3. EXECUTE PRESS
    requestAnimationFrame(() => {
        onPress(e);
    });
  };

  return (
    <RNTouchableOpacity 
      activeOpacity={0.7} 
      onPress={handlePress} 
      {...props} 
    >
      {children}
    </RNTouchableOpacity>
  );
};