import React, { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View, TouchableOpacity, Alert, Platform, Dimensions, ScrollView } from "react-native";
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { fetchRestaurantById } from "@/redux/slices/user/restaurantSlice";
import RestaurantHeader from "./header";
import RestaurantMenu from "./menu";
import AppText from "@/components/AppText";
import RestaurantMenuSkeleton from "../loader/RestaurantMenuSkeleton";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";
import AnimatedNavbar from "../component/AnimatedNavbar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // Ensure this is installed
import { X } from "lucide-react-native";
import RootWrapper from "@/app/rootWrapper";
// import Animated, { useAnimatedKeyboard } from "react-native-reanimated";

const { width, height } = Dimensions.get("window")

export default function RestaurantPage() {
  const [showMenu, setShowMenu] = useState(false);
  const { setVisible } = useBottomBarVisibility();
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { restaurant, menu, loading } = useSelector((s) => s.restaurants);
  
  // --- 1. ADD STATE FOR ACTIVE CATEGORY ---
  const [activeCategory, setActiveCategory] = useState(null);
  
  // --- 2. CREATE REF FOR CHILD MENU ---
  const menuRef = useRef(null);
  
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  })

    // --- 3. HANDLE SCROLL TO CATEGORY ---
  const scrollToCategory = (categoryTitle) => {
    // A. Call the child function
    menuRef.current?.scrollToCategory(categoryTitle);

    // B. Close the menu
    setShowMenu(false);

    // C. Optimistically set active color
    setActiveCategory(categoryTitle);
  }

  useEffect(() => {
      dispatch(fetchRestaurantById(id));
  }, [id]);

  useEffect(() => {
    setVisible(false);     
    return () => setVisible(true);  
  }, []);

  const handleShowMenu = () => {
    setShowMenu(true);
  }

  // --- DATA TRANSFORMER (Converts your API format to Swiggy Menu format) ---
    const menuStructure = useMemo(() => {
      if (!menu) return [];
  
      return Object.entries(menu).map(([categoryName, items]) => {
        
        // 1. Prepare to group items by their sub-category
        const subGroups = {};
        let hasSubCategories = false;
  
        items.forEach(item => {
          // ---------------------------------------------------------
          // ⚠️ CRITICAL: Check where your item stores its sub-category name
          // Based on standard patterns, it's usually item.subCategory (string)
          // or item.subCategoryId.name
          // ---------------------------------------------------------
          const subName = item.subCategory || (typeof item.subCategoryId === 'object' ? item.subCategoryId.name : item.subCategoryId) || null;
  
          if (subName) {
            hasSubCategories = true;
            if (!subGroups[subName]) subGroups[subName] = 0;
            subGroups[subName]++; // Increment count for this sub-category
          }
        });
  
        // 2. Convert the groups object into an Array [{title: "Noodles", count: 2}, ...]
        const subCategoriesList = Object.entries(subGroups).map(([name, count]) => ({
          title: name,
          count: count
        }));
  
        // 3. Return the Final Structure
        return {
          title: categoryName,       // e.g., "Chinese"
          count: items.length,       // Total count (e.g., 5)
          items: items,              // Actual food items for the main list
          subCategories: subCategoriesList // e.g., [{title: "Noodles", count: 2}, {title: "Rice", count: 3}]
        };
      });
    }, [menu]);
  

  if (loading || !restaurant || !menu) return <RestaurantMenuSkeleton />;

  return (
    <>
    {/* // ✅ 1. ROOT CONTAINER: Must have flex: 1 */}
    {/* <RootWrapper immersive={true} bottombar={true}> */}
    <View style={styles.container}>
      
      {/* Navbar sits on top */}
      <AnimatedNavbar scrollY={scrollY} title={restaurant?.name} />
      
      {/* ✅ 2. SCROLL CONTENT */}
      {/* This takes up all available space behind the FAB */}
      {/* <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Add padding so content isn't hidden behind FAB
      > */}
          
          
          {/* ⚠️ IMPORTANT: Ensure RestaurantMenu inside here is JUST a View, NOT a ScrollView */}
          <RestaurantMenu 
            ref={menuRef} 
            menu={menu || {}} 
            restaurant={restaurant} 
            onSectionChange={(cat) => setActiveCategory(cat)} 
            scrollHandler={scrollHandler}
            headerComponent={<RestaurantHeader restaurant={restaurant} />}
          />
          
      {/* </Animated.ScrollView> */}

      {/* ✅ 3. FLOATING FAB (Outside ScrollView) */}
      {/* This ensures it stays fixed to the screen bottom regardless of scrolling */}
      <View style={[styles.fabContainer, ]}>
         {showMenu ? (
           <TouchableOpacity 
            style={styles.fab} 
            activeOpacity={0.8}
            onPress={() => setShowMenu(false)}
         >
            {/* <Ionicons name="wrong" /> */}
            <X  size={18} color="#fff" fill="#fff" strokeWidth={3} style={{marginRight: 8}} />
            <AppText style={styles.fabText}>CLOSE</AppText>
         </TouchableOpacity>
         ) : (
           <TouchableOpacity 
            style={styles.fab} 
            activeOpacity={0.8}
            onPress={handleShowMenu}
         >
            <Ionicons name="restaurant-outline" size={18} color="#fff" style={{marginRight: 8}} />
            <AppText style={styles.fabText}>MENU</AppText>
         </TouchableOpacity>
         )}
        
        
      </View>
      {showMenu && (
        <ScrollView style={[styles.menuContainer]}>
             {menuStructure.map((cat) => {
              const isActive = activeCategory === cat.title;
                return (
                  <View key={cat.title} style={{ paddingHorizontal: 15 }}>
            {/* MAIN CATEGORY ROW (e.g., "Chinese - 5") */}
            <TouchableOpacity 
               style={styles.menuRow} 
               onPress={() => scrollToCategory(cat.title)}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <AppText style={[styles.menuRowText, { color: isActive ? '#00b069ff' : '#212121', fontSize: isActive ? 17 : 15 }]}>{cat.title}</AppText>
                   {/* Show arrow only if subcats exist */}
                   {cat.subCategories.length > 0 && (
                       <Ionicons name="chevron-down" size={14} color={isActive ? '#00b069ff' : "#666"} style={{marginLeft: 5, marginTop: 2}} />
                   )}
                </View>
                <AppText style={[styles.menuRowCount, { color: isActive ? '#00b069ff' : '#212121', fontSize: isActive ? 17 : 15 } ]}>{cat.count}</AppText>
            </TouchableOpacity>

            {/* SUB CATEGORY ROWS (e.g., "Noodles - 2") */}
            {/* Only renders if subCategories exist */}
            {cat.subCategories.map(sub => (
               <TouchableOpacity 
                   key={sub.title}
                   style={styles.subMenuRow}
                   onPress={() => scrollToCategory(cat.title)} 
               >
                   <View style={{flexDirection: 'row', alignItems: 'center'}}>
                       {/* L-shaped connector line for visual hierarchy */}
                       <View style={[styles.subCatConnector, { borderColor: isActive ? '#00b069ff' : '#ccc' }]} />
                       <AppText style={styles.subMenuRowText}>{sub.title}</AppText>
                   </View>
                   <AppText style={styles.subMenuRowCount}>{sub.count}</AppText>
               </TouchableOpacity>
            ))}
        </View>
    )})}
    </ScrollView>
      )}

    </View>
    {/* </RootWrapper> */}
  </>
    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Crucial for full screen height
    // backgroundColor: 'rgba(169, 62, 62, 1)',
  },
  // Fixed Position Styles
  fabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    right: 20,
    bottom: 10,
    zIndex: 999, // Ensure it sits on top
    // 'bottom' is handled dynamically in style prop
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B1B1B', // Swiggy Black
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    // Shadow for elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 60
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 1,
  },

  menuContainer: {
    width: width * 0.65,
    height: height * 0.41,
    backgroundColor: "#fff",
    position: "absolute" , 
    borderWidth: 1, 
    borderColor :"#e0e0e0ff", 
    borderRadius: 10, 
    right: 20,
    bottom: 130,
    zIndex: 999,
  },
  
    // Main Row Styles
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    menuRowText: {
        // fontFamily: "Nunito",
        color: '#212121',
        textTransform: 'capitalize'
    },
    menuRowCount: {
        // fontFamily: "Nunito",
        color: '#212121',
    },
    
    // Sub Category Styles
    subMenuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingLeft: 12, // Indent content
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
        backgroundColor: '#fff' 
    },
    subMenuRowText: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize'
    },
    subMenuRowCount: {
        fontSize: 13,
        color: '#888'
    },
    // The "L" shape connector
    subCatConnector: {
        width: 10,
        height: 10,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginRight: 10,
        marginBottom: 4,
        borderBottomLeftRadius: 4
    }
});