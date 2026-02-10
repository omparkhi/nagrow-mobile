import AppText from "@/components/AppText";
import Banner from "./banner";
import Category from "./category";
import Restaurant from "./restaurant";
import { View } from "react-native";
import { ScrollView } from "react-native";
import SearchBar from "./searchbar";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import LogoutButton from "../../restaurant/dashboard/logout-button";
import { useRouter } from "expo-router";
import { DefaultTheme } from "@react-navigation/native";
import NagrowToast from "@/app/toast/NagrowToast";
import RootWrapper from "@/app/rootWrapper";
import SearchModal from "./searchModal";
import { useCallback, useState } from "react";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useScrollHandler } from "@/hooks/useScrollHandler";
import PremiumCard from "./PremiumCard";
import FilterList from "../component/FilterList";
import { SlidersHorizontal } from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler, 
  interpolate, 
  Extrapolation,
  useAnimatedReaction,
  runOnJS
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLayoutConfig } from "@/app/context/LayoutContext";
import Footer from "../Footer";
import TopPicks from "./top-picks";

// --- CONFIGURATION ---
const BANNER_HEIGHT = 320; 
// Distance from top of screen where Search Bar sits initially
const SEARCH_INITIAL_Y = 110; 
const SEARCH_BAR_HEIGHT = 50;


export default function UserDash() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const handleScroll = useScrollHandler();

  // 1. Define available filters
  const FILTER_CONFIG = [
    { 
      id: 'sort', 
      label: 'Sort', 
      type: 'dropdown', 
      leftIcon: <SlidersHorizontal size={14} color="#363636" /> 
    },
    { 
      id: 'nearest', 
      label: 'Nearest', 
      type: 'toggle' 
    },
    { 
      id: 'rating', 
      label: 'Rating 4.0+', 
      type: 'toggle' 
    },
    { 
      id: 'pure_veg', 
      label: 'Pure Veg', 
      type: 'toggle' 
    },
    { 
      id: 'cuisines', 
      label: 'Cuisines', 
      type: 'dropdown' 
    },
    { 
      id: 'offers', 
      label: 'Great Offers', 
      type: 'toggle' 
    }
  ];

  const [barStyle, setBarStyle] = useState("light");
  const [activeFilters, setActiveFilters] = useState(['sort']);
  const { setIsImmersive, setBottomSafeColor } = useLayoutConfig();

  // 👇 The Magic: Turn off Safe Area ONLY for this screen
  useFocusEffect(
    useCallback(() => {
      // 1. When Screen Focuses: Enable Immersive Mode (Hide Top Safe Area)
      setIsImmersive(true);
      setBottomSafeColor("white"); // Set bottom bar to white if needed

      return () => {
        // 2. When Screen Unfocuses (Navigating away): Reset to Default
        setIsImmersive(false);
        setBottomSafeColor("transparent");
      };
    }, [])
  );

  // scroll handler
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
    runOnJS(handleScroll)({ 
        nativeEvent: event 
      });
  })

  // 2. Status Bar Switcher (White -> Black)
  // We trigger this when the Search Bar hits the top
  const stickyThreshold = insets.top;

  useAnimatedReaction(
    () => scrollY.value >= stickyThreshold, // Switch slightly before it hits
    (isSticky, prev) => {
      if (isSticky !== prev) {
        runOnJS(setBarStyle)(isSticky ? "dark" : "light");
      }
    }
  );

  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [stickyThreshold - 30, stickyThreshold],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity, // 0 -> 1
      backgroundColor: "white",
      elevation: opacity > 0.5 ? 4 : 0, // Shadow only when visible
      borderBottomWidth: opacity === 1 ? 1 : 0,
      borderBottomColor: '#f0f0f0',
      // paddingBottom: 100
    };
  });
  const stickySearchStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-100, 0, stickyThreshold],
      [SEARCH_INITIAL_Y + 400, SEARCH_INITIAL_Y, insets.top + 5], // Land slightly below status bar
      Extrapolation.CLAMP 
    );

    return {
      transform: [{ translateY }], 
    };
  });

// 3. Handler
  const handleFilterPress = (filterItem) => {
    console.log("Pressed:", filterItem.label);

    if (filterItem.type === 'dropdown') {
        // Open Bottom Sheet / Modal logic here
        // bottomSheetRef.current.present(filterItem.id);
        return;
    }

    // Toggle Logic for simple buttons
    setActiveFilters(prev => {
        if (prev.includes(filterItem.id)) {
            return prev.filter(id => id !== filterItem.id); // Remove
        } else {
            return [...prev, filterItem.id]; // Add
        }
    });
  };


  // const [currentFilterMode, setCurrentFilterMode] = useState("OFF");
  
  const [searchVisible, setSearchVisible] = useState(false); // State for modal
  const router = useRouter();

  // 1. 👇 ADD STATE HERE (Lifting State Up)
  const [filterMode, setFilterMode] = useState("OFF");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 2. 👇 CREATE HANDLER
  const handleFilterChange = (mode) => {
    console.log("Filter Mode Changed to:", mode);
    setFilterMode(mode);
  };

  const handleCategorySelect = (categoryKey) => {
    if (selectedCategory === categoryKey) {
      setSelectedCategory(null); // Clicked same item? Deselect it.
    } else {
      setSelectedCategory(categoryKey); // Select new item
    }
  };

    const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userType");

      // Expo Router way
      router.replace("/");
         // <-- change path if needed

    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  // console.log("DefaultTheme:", DefaultTheme);
    return (
      <RootWrapper immersive={true} barStyle={barStyle} bottombar={true}>
      <View style={{ flex: 1, backgroundColor: "#fff",  }}>
        <Animated.View 
        pointerEvents="none"
            style={[
                styles.headerBackground, 
                { height: insets.top + 70 }, // Covers Status Bar + Search Height
                headerBackgroundStyle
            ]}
        />
        <Animated.View 
          style={[
            styles.stickySearchContainer, 
            stickySearchStyle // Moves up and down
          ]}
        >
            <SearchBar onPress={() => setSearchVisible(true)} onFilterChange={handleFilterChange}  />
        </Animated.View>
    <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={scrollHandler} scrollEventThrottle={16}  >
      {/* <HidingScrollView style={{ flex: 1, backgroundColor: "#fff" }} stickyHeaderIndices={[1]}> */}
      {/* <View style={{ position: "absolute" }}> */}
        {/* <NagrowToast/> */}
      {/* </View> */}
         <Banner />
        {/* <View style={{ marginTop: -190, zIndex: 999, elevation: 10 }}>
        </View> */}
        
        
        <View style={styles.contentContainer}>
          <PremiumCard />
          <TopPicks />
          <FilterList 
            filters={FILTER_CONFIG}
            selectedFilters={activeFilters}
            onFilterPress={handleFilterPress}
            style={{ marginBottom: 10 }}
         />

         <Restaurant filterMode={filterMode} activeFilters={activeFilters} />
        </View>
        {/* <TouchableOpacity style={styles.btn} onPress={handleLogout}>
      <AppText style={styles.text}>Logout</AppText>
      
      {/* <AppText style={styles.text}>Order</AppText> */}

    {/* </TouchableOpacity> */} 
    {/* // <TouchableOpacity style={styles.btn} onPress={() => router.push(`/user/order/${"6945693fd9cdd4ec0569c435"}`)}>
    //     <AppText >Order</AppText>
    //   </TouchableOpacity> */}
        {/* <Category /> */}
        
        
        {/* </HidingScrollView>  */}
     </Animated.ScrollView>
     <SearchModal 
      visible={searchVisible}
      onClose={() => setSearchVisible(false)}
     />
     
    </View> 
    
     </RootWrapper>
)
}

const styles = StyleSheet.create({
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999, // Behind the Search Bar (1000) but above Banner
  },
  stickySearchContainer: {
    position: 'absolute',
    top: 0, // We control Y position via translateY
    left: 0,
    right: 0,
    zIndex: 1000, // On Top
    justifyContent: 'center',
    paddingHorizontal: 0, // Adjust if your SearchBar has internal padding
  },
  contentContainer: {
    backgroundColor: '#fff',
    paddingTop: 10,
  }
});