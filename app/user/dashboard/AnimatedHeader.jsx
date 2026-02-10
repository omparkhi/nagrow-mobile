import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import AppText from "@/components/AppText";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import SearchBar from "./searchbar";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { fetchAddresses } from "@/redux/slices/user/addressSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SAFE_AREA = 44;
const ADDRESS_HEIGHT = 56;
const SEARCH_HEIGHT = 56;

export const HEADER_HEIGHT =
  SAFE_AREA + ADDRESS_HEIGHT + SEARCH_HEIGHT;

export default function AnimatedHeader({ scrollY, onSearch, onFilterChanged }) {
    const insets = useSafeAreaInsets(); 
    const router = useRouter();
      const dispatch = useDispatch();
      const selectedAddress = useSelector((state) => state.address.selectedAddress);
    //   const scrollY = React.useRef(new Animated.Value(0)).current;
    
    //   useEffect(() => {
    //     InteractionManager.runAfterInteractions(() => {
    //       dispatch(fetchAddresses());
    //     })
    //   }, []); 
   const AnimatedMaterialIcon =
  Animated.createAnimatedComponent(MaterialIcons);

const AnimatedFeather =
  Animated.createAnimatedComponent(Feather);

const AnimatedIonicons =
  Animated.createAnimatedComponent(Ionicons);

  const headerProgress = useDerivedValue(() => {
  return Math.min(scrollY.value / 60, 1);
});



const iconColor = useDerivedValue(() =>
  interpolateColor(
    headerProgress.value,
    [0, 1],
    ["#000000ff", "#ffff"]
  )
);

const iconColors = useDerivedValue(() =>
  interpolateColor(
    headerProgress.value,
    [0, 1],
    ["#ffffffff", "#000000ff"]
  )
);

const iconAnimatedProps = useAnimatedProps(() => ({
  color: iconColor.value,
}));

const iconAnimatedPropss = useAnimatedProps(() => ({
  color: iconColors.value,
}));

const bgStyle = useAnimatedStyle(() => ({
  backgroundColor: interpolateColor(
    headerProgress.value,
    [0, 1],
    ["rgba(0,0,0,0)", "#ffffff"]
  ),
}));


const textStyle = useAnimatedStyle(() => ({
  color: interpolateColor(
    headerProgress.value,
    [0, 1],
    ["#ffffff", "#000000"]
  ),
}));

const profileBgStyle = useAnimatedStyle(() => ({
  backgroundColor: interpolateColor(
    headerProgress.value,
    [0, 1],
    ["#ffffff", "#000000"]
  ),
}));

// const topBgStyle = useAnimatedStyle(() => {
//   return {
//     height: insets.top + 80,
//     backgroundColor: interpolateColor(
//       scrollY.value,
//       [0, 120],
//       ["#FF6A00", "#FFFFFF"],
//     ),
//   };
// });


  return (
    <Animated.View style={[styles.container]}>

      {/* Safe Area */}
      <Animated.View />

      {/* Address Row */}
      <View style={styles.topRow}>
                <View style={{ width: "80%" }}>
                  <TouchableOpacity feedback="medium" style={styles.addressWrap} onPress={() => router.push("/user/address/address-card")}>
                  <AnimatedMaterialIcon
  name="home"
  size={22}
  animatedProps={iconAnimatedPropss}
/>


                  <Animated.Text variant="caption" color="white"  style={[styles.label, textStyle]}>
                    Home
                  </Animated.Text>
                  <AnimatedFeather
  name="chevron-down"
  size={22}
  animatedProps={iconAnimatedPropss}
/>

                  </TouchableOpacity>
      
                  <Animated.Text numberOfLines={1} ellipsizeMode="tail" style={[styles.addressText, textStyle]}>
                    {selectedAddress ? selectedAddress.fullAddress : "Fetching location..."}
                  </Animated.Text>
                </View>
                <Animated.View style={[styles.profileBtn, profileBgStyle]}>
                <TouchableOpacity onPress={() => router.push("/user/profile/page")}>
                  <AnimatedIonicons
  name="person"
  size={22}
  animatedProps={iconAnimatedProps}
/>

                </TouchableOpacity>
                </Animated.View>
              </View>

      {/* Sticky Search */}
      <View style={styles.searchWrap}>
        <SearchBar onPress={onSearch} onFilterChange={onFilterChanged} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // paddingTop: insets.top,
backgroundColor: "transparent"
  },
  addressText: {
  fontSize: 13  ,
  fontFamily: "Nunito",
  lineHeight: 13,
  color: "#ffffffff",
},
profileBtn: {
  width: 40,
  height: 32,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
}
,

  header: {
    height: 280,
    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  label: {
    marginLeft: 5,
    fontSize: 18,
    fontFamily: "Nunito-Bold"
  },

  topRow: {
    paddingHorizontal: 18,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  addressWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileIcon: {
    
  },

  lottieWrap: {
    justifyContent: "center",
    alignItems: "center",
    // marginTop: -10,
  },

  searchContainer: {
    marginTop: -170,
    flexDirection: "row",
    paddingHorizontal: 16,
  },

  searchBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    height: 45,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 5,
  },

  placeholderRow: {
    position: "absolute",
    left: 38,
    
    flexDirection: "row",
  },

  vegBox: {
    backgroundColor: "#fff",
    marginLeft: 8,
    paddingHorizontal: 5,
    // paddingVertical: 1,
    borderRadius: 8,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  toggle: {
    width: 37,
    height: 15,
    backgroundColor: "#ddd",
    borderRadius: 12,
    // marginTop: 1,
    marginTop: -4,
    padding: 2,
    justifyContent: "center",
  },

  toggleActive: {
    backgroundColor: "#1fa71f",
  },

  toggleCircle: {
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  searchWrap: {
    height: SEARCH_HEIGHT,
    // paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 20
  },
});