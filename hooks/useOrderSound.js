import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';
import { useRef } from 'react';

export default function useOrderSound() {
  const soundRef = useRef(null);

  const playSound = async () => {
    try {
      // 1. Cleanup old sound
      if (soundRef.current) await soundRef.current.unloadAsync();

      console.log('🎵 Loading Order Alert...');

      // 2. Setup Audio Mode (Loud & Clear)
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true, // Critical for Riders
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      // 3. Load the "Proper" Audio File
      // Make sure this file is 3-5 seconds long!
      const { sound } = await Audio.Sound.createAsync(
         require('@/assets/notification/order-alert.mp3'), 
         { isLooping: true } // Loops smoothly
      );
      
      soundRef.current = sound;
      await sound.playAsync();

      // 4. 📳 THE "ORDER ALERT" VIBRATION PATTERN
      // "Call" Pattern = [1000, 1000] (Boring)
      // "Order" Pattern = [0, 500, 200, 500] (Bzzt... Bzzt... Pause...)
      
      // Pattern: Wait 0ms, Vibrate 500ms, Wait 200ms, Vibrate 500ms, Wait 1500ms
      const ALERT_PATTERN = [0, 500, 200, 500, 1500];
      
      Vibration.vibrate(ALERT_PATTERN, true); // Loop indefinitely

    } catch (error) {
      console.log('Sound Error:', error);
    }
  };

  const stopSound = async () => {
    // Stop Vibration immediately
    Vibration.cancel();

    // Stop Sound smoothly
    if (soundRef.current) {
        try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
        } catch(e) { console.log(e) }
        soundRef.current = null;
    }
  };

  return { playSound, stopSound };
}