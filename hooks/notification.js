import { Audio } from "expo-av";
import { Vibration, Platform } from "react-native";

/**
 * Configure Audio to play even in silent mode (iOS mainly)
 */
const configureAudioSession = async () => {
    try {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true, // CRITICAL: Allows sound even if hardware switch is silent
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });
    } catch (e) {
        console.log("Error configuring audio session:", e);
    }
};



//   Helper function to play sound, vibrate, and clean up memory
const playNotification = async (soundFile) => {
    try {
        // 1. Ensure Audio Session is active
        await configureAudioSession();

        // 2. Trigger Vibration
        // Pattern: Wait 0ms, Vibrate 500ms, Wait 200ms, Vibrate 500ms
        // (Patterns work best on Android; iOS simply vibrates)
        const ONE_SECOND = 1000;
        const PATTERN = Platform.OS === 'android' ? [0, 500, 200, 500] : 400; 
        Vibration.vibrate(PATTERN);

        // 3. Create and Play Sound
        const { sound } = await Audio.Sound.createAsync(soundFile);

        // 4. IMPORTANT: Setup listener to unload sound from memory when done
        sound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.didJustFinish) {
                await sound.unloadAsync(); 
            }
        });

        await sound.playAsync();
    } catch (error) {
        console.log("Error processing notification sound/vibration:", error);
    }
};


export const playNewOrderSound = async () => {
    // New Order: Urgent! (Maybe louder sound or longer vibration implied)
    await playNotification(require("@/assets/notification/rest-sound.mp3"));
};

export const playOrderUpdateSound = async () => {
    // Update: Informational
    await playNotification(require("@/assets/notification/order.mp3"));
};

export const playDeliverySuccessSound= async () => {
    // Update: Informational
    await playNotification(require("@/assets/notification/delivery-success.wav"));
};  