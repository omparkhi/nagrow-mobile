import { Audio } from "expo-av";

export const playNewOrderSound = async() => {
    const { sound } = await Audio.Sound.createAsync(
        require("@/assets/notification/rest-sound.mp3")
    );

    await sound.playAsync();
}