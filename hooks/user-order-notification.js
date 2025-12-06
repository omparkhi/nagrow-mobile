import { Audio } from "expo-av";

export const playOrderUpdateSound = async() => {
    const { sound } = await Audio.Sound.createAsync(
        require("@/assets/notification/order.mp3")
    );

    await sound.playAsync();
}