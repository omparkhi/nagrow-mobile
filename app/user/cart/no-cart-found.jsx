import { Rect } from "react-native-svg";
import { View } from "react-native";
import AppText from "@/components/AppText";


export default function NoCartFound() {
    return (
        <View>
            <AppText variant="small">No Restaurany found</AppText>
        </View>
    )
}