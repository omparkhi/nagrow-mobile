// const AllFoodItem = React.memo(({ item, quantity, handleAddItem, handleRemoveItem }) => {
//   const isVeg = item.FoodType === "veg";
//   const dotColor = isVeg ? "green" : "red";

//   return (
//     <View key={item._id} style={styles.gridCard}>
//       <Image source={{ uri: item.image }} style={styles.gridImage} />
                    
//       {/* Grid Info */}
//       <View style={{ paddingHorizontal: 4 }}>
//           <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
//             <View style={{ borderWidth: 1, borderColor: dotColor, borderRadius: 3, padding: 2 }}>
//                 <View style={{ backgroundColor: dotColor, width: 6, height: 6, borderRadius: 4 }} />
//             </View>
//             <View style={styles.ratingBadge}>
//               <Star size={10} color="#044811" fill="#044811" />
//               <AppText style={{ fontSize: 12, color: "#044811" }}>3.5 (1k+)</AppText>
//             </View>
//           </View>

//           <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: -5 }}>
//           <AppText numberOfLines={1} style={{ fontSize: 15, color: "#333",  }}>{item.name}</AppText>
//           </View>
                       
//           <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" , marginTop: 4 }}>
//             <AppText style={{ fontSize: 14, color: "#555" }}> ₹{item.price}</AppText>
                          
//             {/* Add Button Logic */}
//             {quantity === 0 ? (
//               <TouchableOpacity style={styles.addBtnSmall} onPress={() => handleAddItem(item)}>
//                   <AppText style={styles.addTxtSmall}>ADD</AppText>
//               </TouchableOpacity>
//             ) : (
//                 <View style={styles.qtyBoxSmall}>
//                   <TouchableOpacity haptic="heavy" hitSlop={10} onPress={() => handleRemoveItem(item)}><AppText style={styles.qtyBtnSmall}>−</AppText></TouchableOpacity>
//                   <AppText style={styles.qtyValSmall}>{quantity}</AppText>
//                   {/* <AnimatedCounter count={quantity} textStyle={styles.qtyValSmall} style={{ height: 20 }} /> */}
                                
//                   <TouchableOpacity haptic="selection" hitSlop={10} onPress={() => handleAddItem(item)}><AppText style={styles.qtyBtnSmall}>+</AppText></TouchableOpacity>
//                 </View>
//             )}
//             </View>
//          </View>
//       </View>
//     )
// });

// const ListFoodItem = React.memo(({ item, quantity, handleAddItem, handleRemoveItem }) => {
//   const isVeg = item.FoodType === "veg";
//   const dotColor = isVeg ? "green" : "red";

//   return (
//             <View key={item._id} style={styles.listCard}>
//               <View style={{ alignItems: "center", marginTop: -20 }}>
//                 <Image source={{ uri: item.image }} style={styles.listImage} />
//                 <View style={styles.btnWrapper}>
//                   {quantity === 0 ? (
//                     <TouchableOpacity style={styles.addBtnSmall} onPress={() => handleAddItem(item)}>
//                       <AppText style={styles.addTxtSmall}>ADD</AppText>
//                     </TouchableOpacity>
//                   ) : (
//                     <View style={styles.qtyBoxSmall}>
//                       <TouchableOpacity haptic="heavy" hitSlop={10} onPress={() => handleRemoveItem(item)}><AppText style={styles.qtyBtnSmall}>−</AppText></TouchableOpacity>
//                       <AppText style={styles.qtyValSmall}>{quantity}</AppText>
//                       {/* <AnimatedCounter count={quantity} textStyle={styles.qtyValSmall} style={{ height: 20 }} /> */}
//                       <TouchableOpacity haptic="selection" hitSlop={10} onPress={() => handleAddItem(item)}><AppText style={styles.qtyBtnSmall}>+</AppText></TouchableOpacity>
//                     </View>
//                   )}
//                 </View>
//               </View>

//               <View style={{ flex: 1 }}>
//                 <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
//                   <View style={[styles.vegIconBox, { borderColor: dotColor }]}>
//                     <View style={{ backgroundColor: dotColor, width: 6, height: 6, borderRadius: 4 }} />
//                   </View>
//                 </View>
//                 <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    
//                     <AppText style={{ fontSize: 22, lineHeight: 22, color: "#333" }}>{item.name}</AppText>
//                 </View>
//                 <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
//                     <View style={{ alignSelf: "flex-start",  backgroundColor: "#006810ff", padding: 2, borderRadius: 20, marginTop: 5 }} >
//                       <Star size={13} fill="#ffffffff" color="#fff" />
//                     </View>
//                    <AppText variant="small" style={{ fontSize: 15, color: "#333", marginTop: 4 }}>{item?.rating || "3.0"} ({item?.totalRatings || "15"}+)</AppText>
//                    {/* <AppText variant="small" style={{ color: "#333", marginTop: 5 }}>• "30 mins"</AppText> */}
//                 </View>
//                 <AppText variant="small" style={{ fontSize: 17, color: "#353535ff" }}>₹{item.price}</AppText>
//                  <AppText style={{ fontSize: 13, color: "#5d5d5dff",  fontFamily: "Nunito", lineHeight: 15, marginTop: 2, marginLeft: 1 }}>{item.description}</AppText>
//               </View>
//             </View>
//           );
// } );


import React, { useMemo, useRef, useState, useCallback } from "react";
import { View, Image, ScrollView, StyleSheet, Dimensions, Alert, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCartThunk, decrement, clearCart, getSubtotal, getMenuQty } from "@/redux/slices/cart/cartSlice";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { LinearGradient } from "expo-linear-gradient";
import { Star, X } from "lucide-react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import AnimatedCounter from "../component/AnimatedCounter";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

// --- 1. LIST ITEM COMPONENT ---
const FoodItemRow = React.memo(({ item, handleAddItem, handleRemoveItem }) => {
  const isVeg = item.FoodType === "veg";
  const qty = useSelector(state => getMenuQty(state, item._id)); // Total qty of this item (all variants)

  // Check if item needs customization
  const isCustomizable = (item.variants && item.variants.length > 0) || (item.addonGroups && item.addonGroups.length > 0);

  return (
    <View style={styles.listCard}>
       <View style={{ alignItems: "center" }}>
          <Image source={{ uri: item.image }} style={styles.listImage} />
          <View style={styles.btnWrapper}>
             {qty === 0 ? (
                <TouchableOpacity style={styles.addBtnSmall} onPress={() => handleAddItem(item)}>
                   <AppText style={styles.addTxtSmall}>ADD</AppText>
                   {isCustomizable && <AppText style={styles.customText}>Customisable</AppText>}
                </TouchableOpacity>
             ) : (
                <View style={styles.qtyBoxSmall}>
                   <TouchableOpacity onPress={() => handleRemoveItem(item)} hitSlop={10}><AppText style={styles.qtyBtnSmall}>−</AppText></TouchableOpacity>
                   <AppText style={styles.qtyValSmall}>{qty}</AppText>
                   <TouchableOpacity onPress={() => handleAddItem(item)} hitSlop={10}><AppText style={styles.qtyBtnSmall}>+</AppText></TouchableOpacity>
                </View>
             )}
          </View>
       </View>

       <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={[styles.vegIconBox, { borderColor: isVeg ? "green" : "red" }]}>
             <View style={{ backgroundColor: isVeg ? "green" : "red", width: 6, height: 6, borderRadius: 4 }} />
          </View>
          <AppText style={styles.itemName}>{item.name}</AppText>
          <View style={{flexDirection:'row', alignItems:'center', marginTop:4, gap:5}}>
             <Star size={12} color="green" fill="green"/>
             <AppText style={{fontSize:12, color:'green'}}>{item.rating || "4.2"}</AppText>
          </View>
          <AppText style={styles.itemPrice}>₹{item.price}</AppText>
          <AppText numberOfLines={2} style={styles.descText}>{item.description}</AppText>
       </View>
    </View>
  );
});


export default function RestaurantMenu({ menu, restaurant }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const [isSwitching, setIsSwitching] = useState(false);

  const cartTotal = useSelector(getSubtotal);
  const cartQty = cart.reduce((acc, i) => acc + i.quantity, 0); 

  // --- REFS & STATE ---
  const bottomSheetModalRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Customization State
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]); // Array of addon objects

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['40%'], []);

  // --- HELPERS ---

  // 1. Get Quantity of a specific Item (Sum of all variants)
  const getQty = (itemId) => {
     return cart.filter((i) => i.menuItemId === itemId).reduce((total, i) => total + i.quantity, 0);
  };

  // 2. Get Quantity of a specific Variant
const getVariantQty = (itemId, variantId) => {
  // console.log(cart)
    const item = cart.find((cartItem) => {
        return (
            cartItem.menuItemId.toString() === itemId.toString() &&
            cartItem.variantId?.toString() === variantId.toString()
        );
    });
    // console.log("item: ", item)/
    return item ? item.quantity : 0;
  };

  // 3. Get Info for Sticky Footer
  const getModalTotalInfo = () => {
    if (!selectedItem) return { qty: 0, price: 0 };
    const relevantItems = cart.filter((i) => i.menuItemId === selectedItem._id);
    return {
        qty: relevantItems.reduce((total, i) => total + i.quantity, 0),
        price: relevantItems.reduce((total, i) => total + (i.price * i.quantity), 0)
    };
  };

  // --- HANDLERS ---

const handleAddItem = useCallback((menuItem) => {
  const hasAddons = menuItem.addonGroup && menuItem.addonGroup.length > 0;
  const hasVariants = menuItem.hasVariants && menuItem.variants && menuItem.variants?.length > 0
    if (hasAddons || hasVariants) {
      setSelectedItem(menuItem);
      if (hasVariants) setSelectedVariant(menuItem.variants[0]);
      else setSelectedVariant(null);
      setSelectedAddons([]); // Reset addons
      bottomSheetModalRef.current?.present();
    } else {
      // Direct Add (Dispatch logic duplicated here to avoid dependency cycle if helper is outside)
      dispatch(addToCartThunk({
        menuItem,
        restaurant: { _id: restaurant._id, name: restaurant.name },
        selectedVariant: null,
        selectedAddons: []
      })).then((resultAction) => {
         if (resultAction.payload?.conflict) {
            Alert.alert(
              "Different Restaurant",
              `Cart contains items from ${resultAction.payload.currentRestaurant}. Reset?`,
              [{ text: "No", style: "cancel" }, { text: "Yes", onPress: async () => { await dispatch(clearCart()); dispatch(addToCartThunk({ menuItem, restaurant: { _id: restaurant._id, name: restaurant.name }, selectedVariant: null })); } }]
            );
         }
      });
    }
  }, [dispatch, restaurant]);

  const handleRemoveItem = useCallback((menuItem) => {
    if (menuItem.hasVariants && menuItem.variants?.length > 0) {
      setSelectedItem(menuItem);
      bottomSheetModalRef.current?.present();
    } else {
      dispatch(decrement(menuItem._id));
    }
  }, [dispatch]);

  // Logic to Add/Remove INSIDE Modal
  const handleVariantAction = (variant, action) => {
    if (action === 'add') {
      dispatch(addToCartThunk({ menuItem: selectedItem, restaurant: { _id: restaurant._id, name: restaurant.name }, selectedVariant: variant }));
    } else {
      const cartItem = cart.find(i => i.menuItemId === selectedItem._id && i.variantId === variant._id);
      // console.log("cartItem: ", cartItem)
      if (cartItem) dispatch(decrement(cartItem.id)); 
    }

    // console.log("cart:", cart)
  };

// --- INSIDE RestaurantMenu COMPONENT ---
// --- FIXED TOGGLE LOGIC ---
  const toggleAddon = (group, option) => {
    setSelectedAddons((prev) => {
      // 1. Check if currently selected
      const isAlreadySelected = prev.some((item) => item._id === option._id);
      const isRadio = group.maxSelection === 1;

      // CASE A: REMOVING (Deselect)
      if (isAlreadySelected) {
        // If Radio: You usually can't deselect a radio by clicking it (must click another).
        // If Checkbox: Remove it.
        if (!isRadio) {
          return prev.filter((item) => item._id !== option._id);
        }
        return prev; // Return current state (do nothing) for Radio
      }

      // CASE B: ADDING (Select)
      
      // Get all items currently selected in THIS specific group
      const currentSelectionInGroup = prev.filter((item) => 
        group.options.some((gOpt) => gOpt._id === item._id)
      );

      if (isRadio) {
        // Radio: Remove ALL other items from this group, add the new one
        const otherOptions = prev.filter((item) => 
          !group.options.some((gOpt) => gOpt._id === item._id)
        );
        return [...otherOptions, option];
      } else {
        // Checkbox: Check Limit
        if (currentSelectionInGroup.length >= group.maxSelection) {
          Alert.alert(`Limit Reached`, `You can select a maximum of ${group.maxSelection} options.`);
          return prev;
        }
        // Add new option
        return [...prev, option];
      }
    });
  };

  // --- FIXED TOTAL CALCULATION (Ensures Numbers) ---
  const calculateItemTotal = () => {
      let total = selectedVariant ? Number(selectedVariant.price) : Number(selectedItem?.price || 0);
      
      selectedAddons.forEach(a => {
          total += Number(a.price);
      });
      
      return total;
  };

  const handleCategoryChange = (cat) => {
    if (cat === selectedCategory) return;
    
    setIsSwitching(true); // Show loader
    
    // Tiny delay to force React to unmount old list and mount new one cleanly
    setTimeout(() => {
        setSelectedCategory(cat);
        setIsSwitching(false); // Hide loader
    }, 200); 
  };


  // const processAddToCart = async (menuItem, variant) => {
  //   const resultAction = await dispatch(addToCartThunk({
  //     menuItem,
  //     restaurant: { _id: restaurant._id, name: restaurant.name },
  //     selectedVariant: variant
  //   }));

  //   const result = resultAction.payload;

  //   if (result?.conflict) {
  //     Alert.alert(
  //       "Different Restaurant",
  //       `Cart contains items from ${result.currentRestaurant}. Reset?`,
  //       [
  //         { text: "No", style: "cancel" },
  //         { 
  //           text: "Yes, Reset", 
  //           onPress: async () => {
  //             await dispatch(clearCart());
  //             dispatch(addToCartThunk({ menuItem, restaurant: { _id: restaurant._id, name: restaurant.name }, selectedVariant: variant }));
  //           } 
  //         }
  //       ]
  //     );
  //   }
  // };

  // Backdrop
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  // --- RENDER LOGIC ---
const itemsToRender = useMemo(() => {
    if (selectedCategory === "ALL") {
      return Object.values(menu || {}).flat();
    }
    return menu?.[selectedCategory] || [];
  }, [menu, selectedCategory]);

  const { qty: modalQty, price: modalPrice } = getModalTotalInfo();

  if (!menu || Object.keys(menu).length === 0) {
    return <AppText>No menu available</AppText>;
  }

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 20, marginBottom: 100  }}>

      {/* CATEGORY TABS */}
      {menu && Object.keys(menu).length > 0 &&
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {["ALL", ...Object.keys(menu)].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity key={cat} onPress={() => handleCategoryChange(cat)} style={[styles.catItem, isActive && styles.catItemActive]}>
                <AppText style={{ fontSize: 16, color: isActive ? "#1d1d1d" : "#7e7e7e" }}>{cat === "ALL" ? "All" : cat}</AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      }

      {/* MENU ITEMS LIST */}
      <View style={{ marginTop: 15 }}>
        {/* {isSwitching ? (
            <View style={{  justifyContent: 'center', alignItems: 'center', height: height * 0.50, backgroundColor: "#ffffffff" }}>
                <ActivityIndicator size="large" color="#00ac22" />
            </View>
        ) : (
            <>
                {selectedCategory === "ALL" ? (
                <View style={styles.gridContainer}>
                    {itemsToRender.map((item) => (
                    <AllFoodItem 
                        key={`${item._id}`} 
                        item={item} 
                        quantity={getQty(item._id)} 
                        handleAddItem={handleAddItem} 
                        handleRemoveItem={handleRemoveItem}
                    />
                    ))}
                </View>
                ) : (
                <View>
                    {itemsToRender.map((item) => (
                    <ListFoodItem 
                        key={`${item._id}`} 
                        item={item} 
                        quantity={getQty(item._id)} 
                        handleAddItem={handleAddItem}
                        handleRemoveItem={handleRemoveItem}
                    />
                    ))}
                </View>
                )}
            </>
        )} */}
        <ScrollView contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 15}}>
            {itemsToRender.map(item => (
                <FoodItemRow key={item._id} item={item} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />
            ))}
        </ScrollView>
      </View>


      {/* --- BOTTOM SHEET MODAL --- */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        // snapPoints={snapPoints}
         enableDynamicSizing={true}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ borderRadius: 20 }}
      >
        <BottomSheetView style={styles.contentContainer}>
            
            <View style={styles.modalHeader}>
               <View style={{flexDirection:'row', gap:12, alignItems:'center',}}>
                   {selectedItem?.image && <Image source={{uri: selectedItem.image}} style={styles.modalImg} />}
                   <View style={{  }}>
                       <AppText style={styles.modalTitle}>{selectedItem?.name}</AppText>
                       {/* <AppText variant="small" style={{color:'#666'}}>Customize your order</AppText> */}
                   </View>
               </View>
               <TouchableOpacity onPress={() => bottomSheetModalRef.current?.close()} style={styles.closeBtn}>
                   <X size={22} color="#ffffffff" />
               </TouchableOpacity>
            </View>

            <View style={styles.divider} />
            {/* <LinearGradient 
              colors={['#20265cff', 'rgba(255,255,255,0)']} 
              start={{ x: 0, y: 0 }}
              end={{ x: 0.95, y: 0 }}
              style={{ width: "100%", height: 1, marginTop: 5 }}
            ></LinearGradient> */}

            {/* Variants List */}
            <View style={{ padding: 20, backgroundColor: "#eee", gap: 10 }}>
              {selectedItem?.variants?.map((variant, index) => {
                const vQty = getVariantQty(selectedItem._id, variant._id);
                // console.log("VQty: ", vQty)
                // console.log("select item id:", selectedItem._id, "varaianyt id:", variant._id)

                return (
                  <View key={variant._id || index} style={styles.variantRow}>
                    <View style={{ flexDirection: "row", alignItems:"center", justifyContent: "center", gap :9 }}>
                      <AppText style={{ fontSize: 16 }}>{variant.name}</AppText>
                      <AppText style={{ color: '#666', fontSize: 13 }}>₹{variant.price}</AppText>
                    </View>

                    {vQty == 0 ? (
                      <TouchableOpacity style={styles.addBtnSmall} onPress={() => handleVariantAction(variant, 'add')}>
                         <AppText style={styles.addTxtSmall}>ADD</AppText>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.qtyBoxSmall}>
                        <TouchableOpacity haptic="heavy" onPress={() => handleVariantAction(variant, 'remove')} hitSlop={10}>
                           <AppText style={styles.qtyBtnSmall}>−</AppText>
                        </TouchableOpacity>
                        <AppText style={styles.qtyValSmall}>{vQty}</AppText>
                        {/* <AnimatedCounter count={vQty} textStyle={styles.qtyValSmall} style={{ height: 20 }} /> */}
                        <TouchableOpacity haptic="selection" onPress={() => handleVariantAction(variant, 'add')} hitSlop={10}>
                           <AppText style={styles.qtyBtnSmall}>+</AppText>
                        </TouchableOpacity>
                      </View>
                    )}
                   
                  </View>

                  
                );
              })}
            </View>


          {/* Inside your BottomSheetScrollView */}

{selectedItem?.addonGroups?.map((group) => (
  <View key={group._id} style={styles.groupSection}>
    <AppText style={styles.groupTitle}>{group.title}</AppText>
    <AppText style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
      {group.minSelection > 0 ? "Required" : "Optional"} • Max {group.maxSelection}
    </AppText>

    {group.options.map((opt) => {
      // Check if this specific option is in our selected array
      const isSelected = selectedAddons.some((a) => a._id === opt._id);
      
      return (
        <TouchableOpacity
          key={opt._id}
          style={styles.optionRow}
          onPress={() => toggleAddon(group, opt)} // Call the fixed function
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              // Logic: If Radio, use radio icons. If Checkbox, use square icons.
              name={
                group.maxSelection === 1
                  ? isSelected ? "radio-button-on" : "radio-button-off"
                  : isSelected ? "checkbox" : "square-outline"
              }
              size={22}
              color="green"
            />
            <View style={{ marginLeft: 10 }}>
              <AppText>{opt.name}</AppText>
            </View>
          </View>
          <AppText style={{ color: '#666' }}>
            {Number(opt.price) > 0 ? `+ ₹${opt.price}` : 'Free'}
          </AppText>
        </TouchableOpacity>
      );
    })}
  </View>
))}

            {/* Footer */}
            {modalQty > 0 && (
                <View style={styles.footerContainer}>
                    <TouchableOpacity style={styles.footerBtn} onPress={() => bottomSheetModalRef.current?.close()}>
                        <View>
                            <AppText style={{color:'white', fontSize:14}}>{modalQty} Items | ₹{modalPrice}</AppText>
                            {/* <AppText style={{color:'white', fontWeight:'bold', fontSize:16}}>View Cart</AppText> */}
                        </View>
                        <AppText style={{color:'white', fontSize:16}}>Done</AppText>
                    </TouchableOpacity>
                </View>
            )}

        </BottomSheetView>
      </BottomSheetModal>

    </View>
  );
}

const styles = StyleSheet.create({
  // Categories
  catScroll: { paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  catItem: { paddingHorizontal: 10, paddingVertical: 2, marginRight: 10, borderBottomWidth: 2, borderBottomColor: "transparent" },
  catItemActive: { borderBottomColor: "#1d1d1d", borderRadius: 5 },

  // --- GRID STYLES (For "ALL") ---
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: { width: '48%', marginBottom: 16, borderWidth: 1, borderColor: '#dcdcdcff', borderRadius: 12, padding: 8 },
  gridImage: { width: '100%', height: 110, borderRadius: 8, resizeMode: 'cover' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2},
  addBtnSmall: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, width: 65, backgroundColor: 'white', elevation: 1 },
  addTxtSmall: { color: 'green', fontSize: 16, margin: "auto" },
  qtyBoxSmall: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'green', borderRadius: 6, paddingHorizontal: 5, backgroundColor: '#f0fdf4', elevation: 1 },
  qtyBtnSmall: { color: 'green', fontSize: 16, paddingHorizontal: 6 },
  qtyValSmall: { color: 'green', fontSize: 14, },

  // --- LIST STYLES (For Categories) ---
  listCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 15, top: 15, marginBottom: 10, padding: 10, borderRadius: 20, gap: 10, borderBottomWidth: 1, borderBottomColor: "#e1e1e1ff" },
  vegIconBox: { borderWidth: 1, borderRadius: 3, padding: 2 },
  descText: { fontSize: 12, color: "#777", marginTop: 4, fontFamily: 'Nunito' },
  listImage: { width: 110, height: 130, borderRadius: 10 },
  
  // List Buttons
  btnWrapper: { position: "absolute", bottom: -10, backgroundColor:'white', borderRadius: 8, elevation: 1 },
  addBtn: { width: 70, paddingVertical: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, alignItems: 'center', backgroundColor: "white" },
  addTxt: { fontSize: 16, color: "#00ac22" },
  customText: { fontSize: 9, color: '#aaa', position: 'absolute', bottom: -12, width: 80, textAlign:'center' },
  qtyBox: { width: 70, flexDirection: "row", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, paddingVertical: 1, backgroundColor: "white" },
  qtyBtn: { fontSize: 18, color: "#00ac22" },
  qtyVal: { fontSize: 16, color: "#00ac22" },

  // Bottom Sheet
  contentContainer: {
    paddingHorizontal: 0, // Reset padding here
    paddingBottom: 50,    // Add padding at bottom for safety
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  modalTitle: { fontSize: 22, color: '#333' },
  modalImg: { width: 40, height: 40, borderRadius: 6 },
  closeBtn: { padding: 6, backgroundColor: '#000', borderRadius: 20 },
  
  divider: { height: 1, backgroundColor: "#eee" },
  
  // Wrapper for the list of variants
  variantsContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9", // Light grey background for variants area
    gap: 10
  },
  
  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  
  variantAddBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 25,
    borderRadius: 8,
    backgroundColor: "white"
  },
  
  variantQtyBox: {
    width: 90,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#f0fdf4"
  },

  // Footer Button Container
  footerContainer: {
    paddingHorizontal: 20,
    // paddingTop: 15,
    backgroundColor: '#eee' // Ensure background is white behind button
  },
  footerBtn: {
    backgroundColor: '#00965aff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  }
});